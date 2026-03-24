import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCampaignStore } from '../store/campaignStore.db';
import { useContactStore } from '../store/contactStore.db';
import { useTemplateStore } from '../store/templateStore.db';
import { db, dbHelpers } from '../db/database';
import DeliveryChart from '../components/analytics/DeliveryChart';
import EngagementMetrics from '../components/analytics/EngagementMetrics';
import EmailStats from '../components/analytics/EmailStats';
import {
  TrendingUp, TrendingDown, Mail, Eye, MousePointer, AlertCircle, BarChart3,
  Users, Send, Calendar, RefreshCw, ArrowUpRight, ArrowDownRight, Clock, Activity,
  CheckCircle2, XCircle, Inbox, Zap, Filter,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#6366f1', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
const SOFT_CHART = { sent: '#6366f1', opened: '#10b981', clicked: '#f59e0b' };

const Analytics = () => {
  const { campaigns, initializeCampaigns, syncAllCampaignStats } = useCampaignStore();
  const { contacts, initializeContacts } = useContactStore();
  const { templates, initializeTemplates } = useTemplateStore();

  const [emailQueueStats, setEmailQueueStats] = useState({ pending: 0, processing: 0, sent: 0, failed: 0 });
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [dateRange, setDateRange] = useState(30); // days
  const [isLoading, setIsLoading] = useState(true);

  // Load all data
  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          initializeCampaigns(),
          initializeContacts(),
          initializeTemplates(),
        ]);

        // Sync campaign stats from tracking events
        if (syncAllCampaignStats) {
          await syncAllCampaignStats();
        }

        // Load email queue stats
        const qStats = await dbHelpers.getEmailQueueStats();
        setEmailQueueStats(qStats);

        // Load tracking events from Firestore (trackingEvents collection)
        try {
          const events = await db.trackingEvents.toArray();
          setTrackingEvents(events);
        } catch {
          setTrackingEvents([]);
        }
      } catch (error) {
        console.error('Error loading analytics:', error);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
    
    // Auto-refresh analytics every 15 seconds
    const refreshInterval = setInterval(async () => {
      if (syncAllCampaignStats) {
        await syncAllCampaignStats();
      }
      await initializeCampaigns();
      try {
        const events = await db.trackingEvents.toArray();
        setTrackingEvents(events);
      } catch { setTrackingEvents([]); }
    }, 15000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // ─── Derived real stats (merge campaign.stats + trackingEvents) ──
  const stats = useMemo(() => {
    // Stats from campaign documents
    const campaignOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
    const campaignClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
    
    // Stats from live tracking events (may be more up-to-date)
    const trackOpens = trackingEvents.filter(e => e.type === 'open').length;
    const trackClicks = trackingEvents.filter(e => e.type === 'click').length;

    const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
    // Use the higher of campaign stats vs tracking events (in case stats haven't synced yet)
    const totalOpened = Math.max(campaignOpened, trackOpens);
    const totalClicked = Math.max(campaignClicked, trackClicks);
    const totalBounced = campaigns.reduce((sum, c) => sum + (c.stats?.bounced || 0), 0);
    const totalFailed = campaigns.reduce((sum, c) => sum + (c.stats?.failed || 0), 0);

    const openRate = totalSent > 0 ? ((totalOpened / totalSent) * 100) : 0;
    const clickRate = totalSent > 0 ? ((totalClicked / totalSent) * 100) : 0;
    const bounceRate = totalSent > 0 ? ((totalBounced / totalSent) * 100) : 0;
    const deliveryRate = totalSent > 0 ? ((totalDelivered / totalSent) * 100) : 0;
    const ctr = totalOpened > 0 ? ((totalClicked / totalOpened) * 100) : 0; // Click-to-open rate

    return {
      totalSent, totalDelivered, totalOpened, totalClicked, totalBounced, totalFailed,
      openRate, clickRate, bounceRate, deliveryRate, ctr,
      totalContacts: contacts.length,
      activeContacts: contacts.filter(c => c.status === 'active').length,
      totalCampaigns: campaigns.length,
      sentCampaigns: campaigns.filter(c => c.status === 'sent').length,
      draftCampaigns: campaigns.filter(c => c.status === 'draft').length,
      scheduledCampaigns: campaigns.filter(c => c.status === 'scheduled').length,
      sendingCampaigns: campaigns.filter(c => c.status === 'sending').length,
      totalTemplates: templates.length,
      queuePending: emailQueueStats.pending,
      queueSent: emailQueueStats.sent,
      queueFailed: emailQueueStats.failed,
    };
  }, [campaigns, contacts, templates, emailQueueStats]);

  // ─── Campaign performance chart data ────────────────────────
  const campaignChartData = useMemo(() => {
    return campaigns
      .filter(c => c.stats && c.stats.sent > 0)
      .slice(0, 10)
      .map(c => ({
        name: c.name?.length > 18 ? c.name.substring(0, 18) + '…' : c.name,
        sent: c.stats.sent || 0,
        delivered: c.stats.delivered || 0,
        opened: c.stats.opened || 0,
        clicked: c.stats.clicked || 0,
        bounced: c.stats.bounced || 0,
      }));
  }, [campaigns]);

  // ─── Sending activity over time (last N days) ──────────────
  const activityData = useMemo(() => {
    const days = [];
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);

      // Count campaigns that were sent on this day
      let daySent = 0, dayOpened = 0, dayClicked = 0;
      campaigns.forEach(c => {
        if (c.sentAt) {
          try {
            const sentDate = typeof c.sentAt === 'string' ? parseISO(c.sentAt) : new Date(c.sentAt);
            if (isWithinInterval(sentDate, { start: dayStart, end: dayEnd })) {
              daySent += c.stats?.sent || 0;
              dayOpened += c.stats?.opened || 0;
              dayClicked += c.stats?.clicked || 0;
            }
          } catch {}
        }
      });

      days.push({
        date: format(date, dateRange <= 7 ? 'EEE' : 'MMM dd'),
        sent: daySent,
        opened: dayOpened,
        clicked: dayClicked,
      });
    }
    return days;
  }, [campaigns, dateRange]);

  // ─── Email status distribution (pie) ─────────────────────────
  const statusDistribution = useMemo(() => {
    const data = [
      { name: 'Delivered', value: stats.totalDelivered, color: '#10b981' },
      { name: 'Opened', value: stats.totalOpened, color: '#3b82f6' },
      { name: 'Clicked', value: stats.totalClicked, color: '#8b5cf6' },
      { name: 'Bounced', value: stats.totalBounced, color: '#ef4444' },
      { name: 'Failed', value: stats.totalFailed, color: '#f59e0b' },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#e5e7eb' }];
  }, [stats]);

  // ─── Campaign status breakdown (pie) ────────────────────────
  const campaignStatusData = useMemo(() => {
    const data = [
      { name: 'Sent', value: stats.sentCampaigns, color: '#10b981' },
      { name: 'Sending', value: stats.sendingCampaigns, color: '#3b82f6' },
      { name: 'Scheduled', value: stats.scheduledCampaigns, color: '#8b5cf6' },
      { name: 'Draft', value: stats.draftCampaigns, color: '#9ca3af' },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: 'No Data', value: 1, color: '#e5e7eb' }];
  }, [stats]);

  // ─── Contact growth (simplified from creation dates) ────────
  const contactGrowthData = useMemo(() => {
    const days = [];
    let cumulative = 0;
    const sortedContacts = [...contacts].sort((a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''));

    for (let i = dateRange - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayEnd = endOfDay(date);

      // Count contacts created up to this day
      const count = sortedContacts.filter(c => {
        try {
          const created = typeof c.createdAt === 'string' ? parseISO(c.createdAt) : new Date(c.createdAt);
          return created <= dayEnd;
        } catch { return false; }
      }).length;

      days.push({
        date: format(date, dateRange <= 7 ? 'EEE' : 'MMM dd'),
        contacts: count,
      });
    }
    return days;
  }, [contacts, dateRange]);

  // ─── Top campaigns by open rate ─────────────────────────────
  const topCampaigns = useMemo(() => {
    return campaigns
      .filter(c => c.stats && c.stats.sent > 0)
      .map(c => ({
        ...c,
        openRate: ((c.stats.opened || 0) / c.stats.sent * 100),
        clickRate: ((c.stats.clicked || 0) / c.stats.sent * 100),
      }))
      .sort((a, b) => b.openRate - a.openRate)
      .slice(0, 5);
  }, [campaigns]);

  // ─── Queue stats ────────────────────────────────────────────
  const queueTotal = emailQueueStats.pending + emailQueueStats.processing + emailQueueStats.sent + emailQueueStats.failed;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading analytics…</p>
        </div>
      </div>
    );
  }

  const noData = campaigns.length === 0 && contacts.length === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Real-time performance from your campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white border border-surface-200 rounded-xl overflow-hidden">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-4 py-2 text-xs font-semibold transition-colors ${
                  dateRange === d ? 'bg-primary-600 text-white' : 'text-gray-500 hover:bg-surface-50'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
          <button
            onClick={async () => {
              setIsLoading(true);
              await Promise.all([initializeCampaigns(), initializeContacts(), initializeTemplates()]);
              const qStats = await dbHelpers.getEmailQueueStats();
              setEmailQueueStats(qStats);
              setIsLoading(false);
            }}
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 shadow-sm"
            title="Refresh"
          >
            <RefreshCw size={18} className="text-gray-500" />
          </button>
        </div>
      </div>

      {noData && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          <p className="font-semibold text-amber-800">No campaign data yet</p>
          <p className="text-sm text-amber-600 mt-1">Send your first campaign to see real-time analytics here.</p>
        </div>
      )}

      {/* ─── Key Metrics Grid ──────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Emails Sent',  value: stats.totalSent.toLocaleString(),   icon: Mail,         iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  sub: `${stats.sentCampaigns} campaign${stats.sentCampaigns !== 1 ? 's' : ''}` },
          { label: 'Open Rate',    value: `${stats.openRate.toFixed(1)}%`,    icon: Eye,          iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', sub: `${stats.totalOpened.toLocaleString()} opens` },
          { label: 'Click Rate',   value: `${stats.clickRate.toFixed(1)}%`,   icon: MousePointer, iconBg: 'bg-violet-50',  iconColor: 'text-violet-600',  sub: `${stats.totalClicked.toLocaleString()} clicks` },
          { label: 'Bounce Rate',  value: `${stats.bounceRate.toFixed(1)}%`,  icon: AlertCircle,  iconBg: 'bg-rose-50',    iconColor: 'text-rose-600',    sub: `${stats.totalBounced.toLocaleString()} bounced` },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="stat-card">
              <div className="flex items-start justify-between mb-3">
                <div className={`icon-box ${stat.iconBg}`}>
                  <Icon className={`w-5 h-5 ${stat.iconColor}`} strokeWidth={2} />
                </div>
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{stat.value}</p>
              <p className="text-xs text-gray-400 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Secondary Metrics ────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Contacts',      value: stats.totalContacts,             icon: Users,       iconBg: 'bg-blue-50',    iconColor: 'text-blue-500'   },
          { label: 'Active',        value: stats.activeContacts,            icon: CheckCircle2,iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500'},
          { label: 'Templates',     value: stats.totalTemplates,            icon: Inbox,       iconBg: 'bg-violet-50',  iconColor: 'text-violet-500' },
          { label: 'Delivery Rate', value: `${stats.deliveryRate.toFixed(1)}%`, icon: Send,   iconBg: 'bg-teal-50',    iconColor: 'text-teal-500'   },
          { label: 'Cl.-to-Open',   value: `${stats.ctr.toFixed(1)}%`,     icon: Zap,         iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'  },
          { label: 'Queued',        value: stats.queuePending,              icon: Clock,       iconBg: 'bg-gray-50',    iconColor: 'text-gray-500'   },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-surface-200 p-4" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}>
              <div className={`icon-box ${m.iconBg} mb-3`}><Icon className={`w-4 h-4 ${m.iconColor}`} /></div>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sending Activity Over Time */}
        <div className="card">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Sending Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last {dateRange} days</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Opened</span>
            </div>
          </div>
          {activityData.some(d => d.sent > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="sent" stroke="#6366f1" fill="url(#sentGrad)" strokeWidth={2} dot={false} name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#10b981" fill="url(#openedGrad)" strokeWidth={2} dot={false} name="Opened" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No sending activity in this period</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Performance Bar Chart */}
        <DeliveryChart campaigns={campaigns} dateRange={dateRange} />
      </div>

      {/* ─── Engagement Metrics ───────────────────────── */}
      <EngagementMetrics campaigns={campaigns} trackingEvents={trackingEvents} dateRange={dateRange} />

      {/* ─── Charts Row 2 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Status Pie */}
        <EmailStats stats={{ sent: stats.totalSent, delivered: stats.totalDelivered, opened: stats.totalOpened, clicked: stats.totalClicked, bounced: stats.totalBounced, failed: stats.totalFailed }} />

        {/* Campaign Status Pie */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-5">Campaign Status</h2>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={campaignStatusData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {campaignStatusData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Contact Growth */}
        <div className="card">
          <div className="mb-5">
            <h2 className="text-sm font-semibold text-gray-900">Contact Growth</h2>
            <p className="text-xs text-gray-500 mt-0.5">Cumulative contacts over time</p>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={contactGrowthData}>
              <defs>
                <linearGradient id="contactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
              <Area type="monotone" dataKey="contacts" stroke="#6366f1" fill="url(#contactGrad)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Top Campaigns Table ─────────────────────────── */}
      {topCampaigns.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-gray-900">Top Performing Campaigns</h2>
            <p className="text-xs text-gray-500 mt-0.5">Ranked by open rate</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Campaign</th>
                  <th className="text-right">Sent</th>
                  <th className="text-right">Open Rate</th>
                  <th className="text-right">Click Rate</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {topCampaigns.map((c, i) => (
                  <tr key={c.id}>
                    <td className="text-gray-400 font-medium">{i + 1}</td>
                    <td>
                      <p className="font-medium text-gray-900">{c.name}</p>
                      {c.sentAt && <p className="text-xs text-gray-400">{format(new Date(c.sentAt), 'MMM dd, yyyy')}</p>}
                    </td>
                    <td className="text-right font-medium text-gray-700">{(c.stats.sent || 0).toLocaleString()}</td>
                    <td className="text-right">
                      <span className={`font-semibold ${c.openRate >= 30 ? 'text-emerald-600' : c.openRate >= 15 ? 'text-amber-600' : 'text-rose-500'}`}>
                        {c.openRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right font-medium text-violet-600">{c.clickRate.toFixed(1)}%</td>
                    <td>
                      <span className={`badge ${ c.status === 'sent' ? 'badge-sent' : c.status === 'sending' ? 'badge-sending' : c.status === 'scheduled' ? 'badge-scheduled' : 'badge-draft' } capitalize`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Email Queue Summary ─────────────────────────── */}
      {queueTotal > 0 && (
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Email Queue</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Pending',    value: emailQueueStats.pending,    bg: 'bg-amber-50',   text: 'text-amber-700'  },
              { label: 'Processing', value: emailQueueStats.processing, bg: 'bg-blue-50',    text: 'text-blue-700'   },
              { label: 'Sent',       value: emailQueueStats.sent,       bg: 'bg-emerald-50', text: 'text-emerald-700'},
              { label: 'Failed',     value: emailQueueStats.failed,     bg: 'bg-rose-50',    text: 'text-rose-700'   },
            ].map((q, i) => (
              <div key={i} className={`rounded-xl p-3 text-center border ${ q.bg }`} style={{ borderColor: 'transparent' }}>
                <p className={`text-xl font-semibold ${q.text} tabular-nums`}>{q.value}</p>
                <p className="text-xs text-gray-500 mt-1">{q.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-2 rounded-full bg-surface-100 overflow-hidden flex gap-0.5">
            {emailQueueStats.sent > 0       && <div className="bg-emerald-400" style={{ width: `${(emailQueueStats.sent       / queueTotal) * 100}%` }} />}
            {emailQueueStats.processing > 0 && <div className="bg-blue-400"    style={{ width: `${(emailQueueStats.processing / queueTotal) * 100}%` }} />}
            {emailQueueStats.pending > 0    && <div className="bg-amber-400"   style={{ width: `${(emailQueueStats.pending    / queueTotal) * 100}%` }} />}
            {emailQueueStats.failed > 0     && <div className="bg-rose-400"    style={{ width: `${(emailQueueStats.failed     / queueTotal) * 100}%` }} />}
          </div>
        </div>
      )}

      {/* ─── Recent Tracking Events ──────────────────────── */}
      {trackingEvents.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100">
            <h2 className="text-sm font-semibold text-gray-900">Live Tracking Events</h2>
            <p className="text-xs text-gray-500 mt-0.5">{trackingEvents.length} events recorded</p>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Campaign</th>
                  <th>Timestamp</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {trackingEvents
                  .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
                  .slice(0, 20)
                  .map((event, i) => {
                    const campaign = campaigns.find(c => c.id === event.campaignId || String(c.id) === String(event.campaignId));
                    return (
                      <tr key={event.id || i}>
                        <td>
                          <span className={`badge ${ event.type === 'open' ? 'badge-sending' : 'badge-scheduled' }`}>
                            {event.type === 'open' ? <Eye className="w-3 h-3" /> : <MousePointer className="w-3 h-3" />}
                            {event.type}
                          </span>
                        </td>
                        <td className="font-medium text-gray-900">
                          {campaign?.name || `Campaign ${event.campaignId}`}
                        </td>
                        <td className="text-gray-400 text-xs">
                          {event.timestamp ? format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm') : '—'}
                        </td>
                        <td className="text-gray-400 text-xs truncate max-w-[200px]">
                          {event.type === 'click' ? event.url : (event.userAgent || '').substring(0, 50)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

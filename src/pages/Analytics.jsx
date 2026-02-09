import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { useCampaignStore } from '../store/campaignStore.db';
import { useContactStore } from '../store/contactStore.db';
import { useTemplateStore } from '../store/templateStore.db';
import { db, dbHelpers } from '../db/database';
import {
  TrendingUp, TrendingDown, Mail, Eye, MousePointer, AlertCircle, BarChart3,
  Users, Send, Calendar, RefreshCw, ArrowUpRight, ArrowDownRight, Clock, Activity,
  CheckCircle2, XCircle, Inbox, Zap, Filter,
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

const Analytics = () => {
  const { campaigns, initializeCampaigns } = useCampaignStore();
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
      } finally {
        setIsLoading(false);
      }
    };
    load();
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
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const noData = campaigns.length === 0 && contacts.length === 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Reports</h1>
          <p className="text-gray-600 mt-2 font-medium">Real-time performance metrics from your campaigns</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                onClick={() => setDateRange(d)}
                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                  dateRange === d ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Emails Sent', value: stats.totalSent.toLocaleString(), icon: Mail, gradient: 'from-blue-500 to-indigo-600', sub: `${stats.sentCampaigns} campaigns` },
          { label: 'Open Rate', value: `${stats.openRate.toFixed(1)}%`, icon: Eye, gradient: 'from-emerald-500 to-teal-600', sub: `${stats.totalOpened.toLocaleString()} opens` },
          { label: 'Click Rate', value: `${stats.clickRate.toFixed(1)}%`, icon: MousePointer, gradient: 'from-purple-500 to-pink-600', sub: `${stats.totalClicked.toLocaleString()} clicks` },
          { label: 'Bounce Rate', value: `${stats.bounceRate.toFixed(1)}%`, icon: AlertCircle, gradient: 'from-red-500 to-rose-600', sub: `${stats.totalBounced.toLocaleString()} bounced` },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-1 font-medium">{stat.sub}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─── Secondary Metrics ────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { label: 'Contacts', value: stats.totalContacts, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active', value: stats.activeContacts, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Templates', value: stats.totalTemplates, icon: Inbox, color: 'text-purple-600 bg-purple-50' },
          { label: 'Delivered', value: `${stats.deliveryRate.toFixed(1)}%`, icon: Send, color: 'text-teal-600 bg-teal-50' },
          { label: 'Click-to-Open', value: `${stats.ctr.toFixed(1)}%`, icon: Zap, color: 'text-amber-600 bg-amber-50' },
          { label: 'Queue', value: `${stats.queuePending} pending`, icon: Clock, color: 'text-gray-600 bg-gray-50' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Charts Row 1 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sending Activity Over Time */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Sending Activity</h2>
              <p className="text-xs text-gray-500">Last {dateRange} days</p>
            </div>
          </div>
          {activityData.some(d => d.sent > 0) ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={activityData}>
                <defs>
                  <linearGradient id="sentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="openedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" fill="url(#sentGrad)" strokeWidth={2} name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#10b981" fill="url(#openedGrad)" strokeWidth={2} name="Opened" />
                <Line type="monotone" dataKey="clicked" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Clicked" />
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
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Campaign Performance</h2>
              <p className="text-xs text-gray-500">Top {campaignChartData.length} campaigns by volume</p>
            </div>
          </div>
          {campaignChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campaignChartData} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Legend />
                <Bar dataKey="sent" fill="#3b82f6" name="Sent" radius={[6, 6, 0, 0]} />
                <Bar dataKey="opened" fill="#10b981" name="Opened" radius={[6, 6, 0, 0]} />
                <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[280px] text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No campaigns with sent data yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Charts Row 2 ────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Status Pie */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Email Status</h2>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={3}
                dataKey="value"
              >
                {statusDistribution.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Campaign Status Pie */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Campaign Status</h2>
          </div>
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
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Contact Growth</h2>
              <p className="text-xs text-gray-500">Cumulative contacts</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={contactGrowthData}>
              <defs>
                <linearGradient id="contactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
              <Area type="monotone" dataKey="contacts" stroke="#06b6d4" fill="url(#contactGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Top Campaigns Table ─────────────────────────── */}
      {topCampaigns.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Top Performing Campaigns</h2>
              <p className="text-xs text-gray-500">Ranked by open rate</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">#</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Campaign</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Sent</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Open Rate</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Click Rate</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topCampaigns.map((c, i) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 text-gray-400 font-bold">{i + 1}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-900">{c.name}</div>
                      {c.sentAt && <div className="text-xs text-gray-400 mt-0.5">{format(new Date(c.sentAt), 'MMM dd, yyyy')}</div>}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-900">{(c.stats.sent || 0).toLocaleString()}</td>
                    <td className="px-5 py-4 text-right">
                      <span className={`inline-flex items-center gap-1 font-bold ${c.openRate >= 30 ? 'text-emerald-600' : c.openRate >= 15 ? 'text-amber-600' : 'text-red-500'}`}>
                        {c.openRate.toFixed(1)}%
                        {c.openRate >= 30 ? <ArrowUpRight size={14} /> : c.openRate < 15 ? <ArrowDownRight size={14} /> : null}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-gray-700">{c.clickRate.toFixed(1)}%</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        c.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                        c.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
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
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Email Queue</h2>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              { label: 'Pending', value: emailQueueStats.pending, color: 'text-amber-600 bg-amber-50' },
              { label: 'Processing', value: emailQueueStats.processing, color: 'text-blue-600 bg-blue-50' },
              { label: 'Sent', value: emailQueueStats.sent, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Failed', value: emailQueueStats.failed, color: 'text-red-600 bg-red-50' },
            ].map((q, i) => (
              <div key={i} className={`rounded-xl p-4 text-center ${q.color}`}>
                <p className="text-2xl font-bold">{q.value}</p>
                <p className="text-xs font-semibold uppercase tracking-wider mt-1">{q.label}</p>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="mt-4 h-3 rounded-full bg-gray-100 overflow-hidden flex">
            {emailQueueStats.sent > 0 && <div className="bg-emerald-500 transition-all" style={{ width: `${(emailQueueStats.sent / queueTotal) * 100}%` }}></div>}
            {emailQueueStats.processing > 0 && <div className="bg-blue-500 transition-all" style={{ width: `${(emailQueueStats.processing / queueTotal) * 100}%` }}></div>}
            {emailQueueStats.pending > 0 && <div className="bg-amber-400 transition-all" style={{ width: `${(emailQueueStats.pending / queueTotal) * 100}%` }}></div>}
            {emailQueueStats.failed > 0 && <div className="bg-red-500 transition-all" style={{ width: `${(emailQueueStats.failed / queueTotal) * 100}%` }}></div>}
          </div>
        </div>
      )}

      {/* ─── Recent Tracking Events ──────────────────────── */}
      {trackingEvents.length > 0 && (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Live Tracking Events</h2>
              <p className="text-xs text-gray-500">{trackingEvents.length} total events recorded</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Type</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Campaign</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Timestamp</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {trackingEvents
                  .sort((a, b) => (b.timestamp || '').localeCompare(a.timestamp || ''))
                  .slice(0, 20)
                  .map((event, i) => {
                    const campaign = campaigns.find(c => c.id === event.campaignId || String(c.id) === String(event.campaignId));
                    return (
                      <tr key={event.id || i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            event.type === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {event.type === 'open' ? <Eye size={11} /> : <MousePointer size={11} />}
                            {event.type}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">
                          {campaign?.name || `Campaign ${event.campaignId}`}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {event.timestamp ? format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm:ss') : '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs truncate max-w-[200px]">
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

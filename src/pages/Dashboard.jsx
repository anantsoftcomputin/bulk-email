import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users, Send, Mail, Eye, MousePointer, AlertCircle, Zap, BarChart3,
  Clock, CheckCircle2, Activity, ArrowUpRight, RefreshCw, Plus,
  TrendingUp, FileText, Inbox,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useCampaignStore } from '../store/campaignStore.db';
import { useContactStore } from '../store/contactStore.db';
import { useTemplateStore } from '../store/templateStore.db';
import { useAuthStore } from '../store/authStore';
import { db, dbHelpers } from '../db/database';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';
import CampaignWizard from '../components/campaigns/CampaignWizard';
import toast from 'react-hot-toast';

// ── Soft chart colors ────────────────────────────────────
const SOFT_COLORS = {
  sent:    '#6366f1',
  opened:  '#10b981',
  clicked: '#f59e0b',
};

const StatusBadge = ({ status }) => {
  const map = {
    sent:      'badge-sent',
    sending:   'badge-sending',
    draft:     'badge-draft',
    failed:    'badge-failed',
    scheduled: 'badge-scheduled',
  };
  return (
    <span className={`badge ${map[status] || 'badge-draft'} capitalize`}>{status}</span>
  );
};

const Dashboard = () => {
  const { campaigns, initializeCampaigns, syncAllCampaignStats } = useCampaignStore();
  const { contacts, initializeContacts } = useContactStore();
  const { templates, initializeTemplates } = useTemplateStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [queueStats, setQueueStats] = useState({ pending: 0, processing: 0, sent: 0, failed: 0 });
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([initializeCampaigns(), initializeContacts(), initializeTemplates()]);
        if (syncAllCampaignStats) await syncAllCampaignStats();
        const qs = await dbHelpers.getEmailQueueStats();
        setQueueStats(qs);
        try { const events = await db.trackingEvents.toArray(); setTrackingEvents(events); }
        catch { setTrackingEvents([]); }
      } catch (e) { console.error('Dashboard load error:', e); toast.error('Failed to load dashboard data'); }
      finally { setIsLoading(false); }
    };
    load();
    const interval = setInterval(async () => {
      if (syncAllCampaignStats) await syncAllCampaignStats();
      await initializeCampaigns();
      const qs = await dbHelpers.getEmailQueueStats();
      setQueueStats(qs);
      try { const events = await db.trackingEvents.toArray(); setTrackingEvents(events); } catch {}
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const campaignOpened  = campaigns.reduce((s, c) => s + (c.stats?.opened  || 0), 0);
    const campaignClicked = campaigns.reduce((s, c) => s + (c.stats?.clicked || 0), 0);
    const trackOpens  = trackingEvents.filter(e => e.type === 'open').length;
    const trackClicks = trackingEvents.filter(e => e.type === 'click').length;
    const totalSent      = campaigns.reduce((s, c) => s + (c.stats?.sent      || 0), 0);
    const totalDelivered = campaigns.reduce((s, c) => s + (c.stats?.delivered || 0), 0);
    const totalOpened    = Math.max(campaignOpened,  trackOpens);
    const totalClicked   = Math.max(campaignClicked, trackClicks);
    const totalBounced   = campaigns.reduce((s, c) => s + (c.stats?.bounced  || 0), 0);
    return {
      totalSent, totalDelivered, totalOpened, totalClicked, totalBounced,
      openRate:  totalSent > 0 ? (totalOpened  / totalSent) * 100 : 0,
      clickRate: totalSent > 0 ? (totalClicked / totalSent) * 100 : 0,
      totalContacts:    contacts.length,
      activeContacts:   contacts.filter(c => c.status === 'active').length,
      totalCampaigns:   campaigns.length,
      activeCampaigns:  campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
      sentCampaigns:    campaigns.filter(c => c.status === 'sent').length,
      draftCampaigns:   campaigns.filter(c => c.status === 'draft').length,
      totalTemplates:   templates.length,
    };
  }, [campaigns, contacts, templates, trackingEvents]);

  const weekActivity = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd   = endOfDay(date);
      let sent = 0, opened = 0;
      campaigns.forEach(c => {
        if (c.sentAt) {
          try {
            const d = typeof c.sentAt === 'string' ? parseISO(c.sentAt) : new Date(c.sentAt);
            if (isWithinInterval(d, { start: dayStart, end: dayEnd })) {
              sent   += c.stats?.sent   || 0;
              opened += c.stats?.opened || 0;
            }
          } catch {}
        }
      });
      trackingEvents.forEach(e => {
        try {
          const d = typeof e.timestamp === 'string' ? parseISO(e.timestamp) : new Date(e.timestamp);
          if (isWithinInterval(d, { start: dayStart, end: dayEnd }) && e.type === 'open') opened++;
        } catch {}
      });
      days.push({ day: format(date, 'EEE'), sent, opened });
    }
    return days;
  }, [campaigns, trackingEvents]);

  const statusPieData = useMemo(() => {
    const data = [
      { name: 'Sent',   value: stats.sentCampaigns,    color: '#10b981' },
      { name: 'Active', value: stats.activeCampaigns,  color: '#6366f1' },
      { name: 'Draft',  value: stats.draftCampaigns,   color: '#d1d5db' },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: 'None', value: 1, color: '#e5e7eb' }];
  }, [stats]);

  const recentCampaigns = campaigns.slice(0, 5);
  const queueTotal = queueStats.pending + queueStats.processing + queueStats.sent + queueStats.failed;
  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };
  const firstName = user?.displayName?.split(' ')[0] || 'there';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-500">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-gray-500 font-medium">{greeting()}, {firstName} 👋</p>
          <h1 className="text-2xl font-semibold text-gray-900 mt-0.5">Dashboard Overview</h1>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="btn-gradient inline-flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus size={16} />
          New Campaign
        </button>
      </div>

      {/* ── Primary KPI Cards ───────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Emails Sent', value: stats.totalSent.toLocaleString(),
            sub: `${stats.totalDelivered.toLocaleString()} delivered`,
            icon: Mail, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600',
            trend: null, link: '/dashboard/analytics',
          },
          {
            title: 'Open Rate', value: `${stats.openRate.toFixed(1)}%`,
            sub: `${stats.totalOpened.toLocaleString()} opens`,
            icon: Eye, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600',
            trend: null, link: '/dashboard/analytics',
          },
          {
            title: 'Click Rate', value: `${stats.clickRate.toFixed(1)}%`,
            sub: `${stats.totalClicked.toLocaleString()} clicks`,
            icon: MousePointer, iconBg: 'bg-violet-50', iconColor: 'text-violet-600',
            trend: null, link: '/dashboard/analytics',
          },
          {
            title: 'Contacts', value: stats.totalContacts.toLocaleString(),
            sub: `${stats.activeContacts} active`,
            icon: Users, iconBg: 'bg-sky-50', iconColor: 'text-sky-600',
            trend: null, link: '/dashboard/contacts',
          },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <Link key={i} to={card.link} className="stat-card group block">
              <div className="flex items-start justify-between mb-3">
                <div className={`icon-box ${card.iconBg}`}>
                  <Icon className={`w-5 h-5 ${card.iconColor}`} strokeWidth={2} />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-primary-400 transition-colors" />
              </div>
              <p className="text-xs font-medium text-gray-500 mb-1">{card.title}</p>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            </Link>
          );
        })}
      </div>

      {/* ── Charts Row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 7-Day Activity */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">7-Day Email Activity</h2>
              <p className="text-xs text-gray-500 mt-0.5">Sent & opened this week</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />Sent</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />Opened</span>
            </div>
          </div>
          {weekActivity.some(d => d.sent > 0 || d.opened > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weekActivity} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gSent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gOpen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.18} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }}
                />
                <Area type="monotone" dataKey="sent"   stroke="#6366f1" fill="url(#gSent)" strokeWidth={2} dot={false} name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#10b981" fill="url(#gOpen)" strokeWidth={2} dot={false} name="Opened" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-gray-300">
              <BarChart3 className="w-10 h-10 mb-2" />
              <p className="text-xs text-gray-400">No activity this week yet</p>
              <button onClick={() => setShowWizard(true)} className="mt-3 text-xs text-primary-600 font-medium hover:underline">
                Create your first campaign →
              </button>
            </div>
          )}
        </div>

        {/* Campaign Status Pie + Quick Stats */}
        <div className="card">
          <h2 className="text-sm font-semibold text-gray-900 mb-1">Campaign Status</h2>
          <p className="text-xs text-gray-500 mb-4">All time overview</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={statusPieData} cx="50%" cy="50%"
                innerRadius={35} outerRadius={58}
                paddingAngle={3} dataKey="value"
              >
                {statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '12px' }}
                formatter={(v, n) => [v, n]}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-3">
            {[
              { label: 'Sent',   value: stats.sentCampaigns,   color: 'text-emerald-600' },
              { label: 'Active', value: stats.activeCampaigns, color: 'text-indigo-600' },
              { label: 'Draft',  value: stats.draftCampaigns,  color: 'text-gray-400' },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-xl font-semibold ${s.color} tabular-nums`}>{s.value}</p>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          {/* Quick-access links */}
          <div className="mt-4 pt-4 border-t border-surface-100 space-y-2">
            {[
              { label: 'View all campaigns',  link: '/dashboard/campaigns',  icon: Send },
              { label: 'Manage contacts',     link: '/dashboard/contacts',   icon: Users },
              { label: 'Browse templates',    link: '/dashboard/templates',  icon: FileText },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <Link key={i} to={item.link} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-surface-50 transition-colors text-gray-600 hover:text-primary-600 group">
                  <Icon size={14} className="text-gray-400 group-hover:text-primary-500 transition-colors" />
                  <span className="text-xs font-medium">{item.label}</span>
                  <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Secondary Metrics Row ────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Total Campaigns', value: stats.totalCampaigns,    icon: Send,         iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-500' },
          { label: 'Active',          value: stats.activeCampaigns,   icon: Activity,     iconBg: 'bg-blue-50',    iconColor: 'text-blue-500' },
          { label: 'Sent',            value: stats.sentCampaigns,     icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500' },
          { label: 'Templates',       value: stats.totalTemplates,    icon: FileText,     iconBg: 'bg-amber-50',   iconColor: 'text-amber-500' },
          { label: 'Queue Pending',   value: queueStats.pending,      icon: Clock,        iconBg: 'bg-orange-50',  iconColor: 'text-orange-500' },
          { label: 'Queue Failed',    value: queueStats.failed,       icon: AlertCircle,  iconBg: 'bg-rose-50',    iconColor: 'text-rose-500' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-surface-200 p-4" style={{ boxShadow: '0 1px 3px 0 rgba(0,0,0,0.04)' }}>
              <div className={`icon-box ${m.iconBg} mb-3`}>
                <Icon className={`w-4 h-4 ${m.iconColor}`} />
              </div>
              <p className="text-lg font-semibold text-gray-900 tabular-nums">{m.value.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-0.5">{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* ── Queue Progress Bar ───────────────────────────── */}
      {queueTotal > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="icon-box bg-gray-100">
                <Inbox className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">Email Queue</h2>
                <p className="text-xs text-gray-400">{queueTotal} total emails</p>
              </div>
            </div>
            <Link to="/dashboard/email-queue" className="text-xs text-primary-600 font-medium hover:underline">
              Manage →
            </Link>
          </div>
          <div className="h-2 rounded-full bg-surface-100 overflow-hidden flex gap-0.5">
            {queueStats.sent > 0       && <div className="bg-emerald-400 rounded-full transition-all"  style={{ width: `${(queueStats.sent       / queueTotal) * 100}%` }} />}
            {queueStats.processing > 0 && <div className="bg-blue-400 rounded-full transition-all"    style={{ width: `${(queueStats.processing / queueTotal) * 100}%` }} />}
            {queueStats.pending > 0    && <div className="bg-amber-400 rounded-full transition-all"   style={{ width: `${(queueStats.pending    / queueTotal) * 100}%` }} />}
            {queueStats.failed > 0     && <div className="bg-rose-400 rounded-full transition-all"    style={{ width: `${(queueStats.failed     / queueTotal) * 100}%` }} />}
          </div>
          <div className="flex items-center gap-5 mt-3">
            {[
              { label: 'Sent',       value: queueStats.sent,       dot: 'bg-emerald-400' },
              { label: 'Processing', value: queueStats.processing, dot: 'bg-blue-400' },
              { label: 'Pending',    value: queueStats.pending,    dot: 'bg-amber-400' },
              { label: 'Failed',     value: queueStats.failed,     dot: 'bg-rose-400' },
            ].map((q, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                <span className={`w-2 h-2 rounded-full ${q.dot}`} />
                <span className="font-medium text-gray-700">{q.value}</span> {q.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Recent Campaigns ────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">Recent Campaigns</h2>
          <Link to="/dashboard/campaigns" className="text-xs text-primary-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Send className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-700 mb-1">No campaigns yet</p>
            <p className="text-xs text-gray-400 mb-4">Create your first campaign to get started</p>
            <button
              onClick={() => setShowWizard(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus size={14} /> Create Campaign
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th className="text-right">Sent</th>
                  <th className="text-right">Opened</th>
                  <th className="text-right">Clicked</th>
                  <th className="text-right">Open Rate</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign) => {
                  const sent    = campaign.stats?.sent    || 0;
                  const opened  = campaign.stats?.opened  || 0;
                  const clicked = campaign.stats?.clicked || 0;
                  const or = sent > 0 ? ((opened / sent) * 100).toFixed(1) : null;
                  return (
                    <tr key={campaign.id}>
                      <td>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM dd, yyyy') : ''}
                        </p>
                      </td>
                      <td><StatusBadge status={campaign.status} /></td>
                      <td className="text-right font-medium text-gray-700">{sent.toLocaleString()}</td>
                      <td className="text-right font-medium text-emerald-600">{opened.toLocaleString()}</td>
                      <td className="text-right font-medium text-violet-600">{clicked.toLocaleString()}</td>
                      <td className="text-right">
                        {or !== null ? (
                          <span className={`font-semibold text-sm ${parseFloat(or) >= 30 ? 'text-emerald-600' : parseFloat(or) >= 15 ? 'text-amber-600' : 'text-gray-400'}`}>
                            {or}%
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaign Wizard */}
      {showWizard && <CampaignWizard isOpen={true} onClose={() => setShowWizard(false)} />}
    </div>
  );
};

export default Dashboard;

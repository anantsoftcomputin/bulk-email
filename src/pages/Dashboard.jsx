import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Send, Mail, TrendingUp, Eye, MousePointer, AlertCircle, Zap, BarChart3,
  Clock, CheckCircle2, Activity, ArrowUpRight, Inbox, RefreshCw,
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { useCampaignStore } from '../store/campaignStore.db';
import { useContactStore } from '../store/contactStore.db';
import { useTemplateStore } from '../store/templateStore.db';
import { db, dbHelpers } from '../db/database';
import { format, subDays, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

const Dashboard = () => {
  const { campaigns, initializeCampaigns, syncAllCampaignStats } = useCampaignStore();
  const { contacts, initializeContacts } = useContactStore();
  const { templates, initializeTemplates } = useTemplateStore();

  const [queueStats, setQueueStats] = useState({ pending: 0, processing: 0, sent: 0, failed: 0 });
  const [trackingEvents, setTrackingEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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
        
        const qs = await dbHelpers.getEmailQueueStats();
        setQueueStats(qs);
        try {
          const events = await db.trackingEvents.toArray();
          setTrackingEvents(events);
        } catch { setTrackingEvents([]); }
      } catch (e) {
        console.error('Dashboard load error:', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // ─── Computed stats ────────────────────────────────────
  const stats = useMemo(() => {
    const campaignOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
    const campaignClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
    const trackOpens = trackingEvents.filter(e => e.type === 'open').length;
    const trackClicks = trackingEvents.filter(e => e.type === 'click').length;

    const totalSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
    const totalDelivered = campaigns.reduce((sum, c) => sum + (c.stats?.delivered || 0), 0);
    const totalOpened = Math.max(campaignOpened, trackOpens);
    const totalClicked = Math.max(campaignClicked, trackClicks);
    const totalBounced = campaigns.reduce((sum, c) => sum + (c.stats?.bounced || 0), 0);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const bounceRate = totalSent > 0 ? (totalBounced / totalSent) * 100 : 0;
    const deliveryRate = totalSent > 0 ? (totalDelivered / totalSent) * 100 : 0;
    const ctr = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;

    return {
      totalSent, totalDelivered, totalOpened, totalClicked, totalBounced,
      openRate, clickRate, bounceRate, deliveryRate, ctr,
      totalContacts: contacts.length,
      activeContacts: contacts.filter(c => c.status === 'active').length,
      totalCampaigns: campaigns.length,
      activeCampaigns: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
      sentCampaigns: campaigns.filter(c => c.status === 'sent').length,
      draftCampaigns: campaigns.filter(c => c.status === 'draft').length,
      totalTemplates: templates.length,
    };
  }, [campaigns, contacts, templates, trackingEvents]);

  // ─── 7-day activity sparkline ──────────────────────────
  const weekActivity = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      let sent = 0, opened = 0;
      campaigns.forEach(c => {
        if (c.sentAt) {
          try {
            const d = typeof c.sentAt === 'string' ? parseISO(c.sentAt) : new Date(c.sentAt);
            if (isWithinInterval(d, { start: dayStart, end: dayEnd })) {
              sent += c.stats?.sent || 0;
              opened += c.stats?.opened || 0;
            }
          } catch {}
        }
      });
      trackingEvents.forEach(e => {
        try {
          const d = typeof e.timestamp === 'string' ? parseISO(e.timestamp) : new Date(e.timestamp);
          if (isWithinInterval(d, { start: dayStart, end: dayEnd })) {
            if (e.type === 'open') opened++;
          }
        } catch {}
      });
      days.push({ day: format(date, 'EEE'), sent, opened });
    }
    return days;
  }, [campaigns, trackingEvents]);

  // ─── Campaign status pie data ──────────────────────────
  const statusPieData = useMemo(() => {
    const data = [
      { name: 'Sent', value: stats.sentCampaigns, color: '#10b981' },
      { name: 'Active', value: stats.activeCampaigns, color: '#3b82f6' },
      { name: 'Draft', value: stats.draftCampaigns, color: '#9ca3af' },
    ].filter(d => d.value > 0);
    return data.length > 0 ? data : [{ name: 'None', value: 1, color: '#e5e7eb' }];
  }, [stats]);

  const recentCampaigns = campaigns.slice(0, 5);
  const queueTotal = queueStats.pending + queueStats.processing + queueStats.sent + queueStats.failed;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <RefreshCw className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-2 font-medium">
            Welcome back! Here's your real-time overview.
          </p>
        </div>
        <Link
          to="/dashboard/campaigns/new"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <Zap size={20} />
          Create Campaign
        </Link>
      </div>

      {/* ─── Primary Stat Cards ──────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Emails Sent', value: stats.totalSent.toLocaleString(), icon: Mail, gradient: 'from-blue-500 to-indigo-600', link: '/analytics', sub: `${stats.totalDelivered.toLocaleString()} delivered` },
          { title: 'Open Rate', value: `${stats.openRate.toFixed(1)}%`, icon: Eye, gradient: 'from-emerald-500 to-teal-600', link: '/analytics', sub: `${stats.totalOpened.toLocaleString()} total opens` },
          { title: 'Click Rate', value: `${stats.clickRate.toFixed(1)}%`, icon: MousePointer, gradient: 'from-purple-500 to-pink-600', link: '/analytics', sub: `${stats.totalClicked.toLocaleString()} total clicks` },
          { title: 'Total Contacts', value: stats.totalContacts.toLocaleString(), icon: Users, gradient: 'from-orange-500 to-red-600', link: '/contacts', sub: `${stats.activeContacts} active` },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Link key={i} to={stat.link}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400 mt-1 font-medium">{stat.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ─── Middle Row: Activity Chart + Campaign Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">7-Day Activity</h2>
              <p className="text-xs text-gray-500">Emails sent & opened this week</p>
            </div>
          </div>
          {weekActivity.some(d => d.sent > 0 || d.opened > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={weekActivity}>
                <defs>
                  <linearGradient id="dashSentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="dashOpenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="sent" stroke="#3b82f6" fill="url(#dashSentGrad)" strokeWidth={2} name="Sent" />
                <Area type="monotone" dataKey="opened" stroke="#10b981" fill="url(#dashOpenGrad)" strokeWidth={2} name="Opened" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No activity this week yet</p>
              </div>
            </div>
          )}
        </div>

        {/* Campaign Status Pie + Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Campaigns</h2>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie data={statusPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                {statusPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.sentCampaigns}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Sent</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.activeCampaigns}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active</p>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stats.draftCampaigns}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Draft</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Performance Metrics Row ──────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Delivery Rate', value: `${stats.deliveryRate.toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Open Rate', value: `${stats.openRate.toFixed(1)}%`, icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Click Rate', value: `${stats.clickRate.toFixed(1)}%`, icon: MousePointer, color: 'text-purple-600 bg-purple-50' },
          { label: 'Click-to-Open', value: `${stats.ctr.toFixed(1)}%`, icon: ArrowUpRight, color: 'text-teal-600 bg-teal-50' },
          { label: 'Bounce Rate', value: `${stats.bounceRate.toFixed(1)}%`, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
          { label: 'Templates', value: stats.totalTemplates, icon: Inbox, color: 'text-amber-600 bg-amber-50' },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${m.color}`}>
                  <Icon size={16} />
                </div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-xl font-bold text-gray-900">{typeof m.value === 'number' ? m.value.toLocaleString() : m.value}</p>
            </div>
          );
        })}
      </div>

      {/* ─── Email Queue (if any items) ───────────────────── */}
      {queueTotal > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Email Queue</h2>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Pending', value: queueStats.pending, cls: 'text-amber-600 bg-amber-50' },
              { label: 'Processing', value: queueStats.processing, cls: 'text-blue-600 bg-blue-50' },
              { label: 'Sent', value: queueStats.sent, cls: 'text-emerald-600 bg-emerald-50' },
              { label: 'Failed', value: queueStats.failed, cls: 'text-red-600 bg-red-50' },
            ].map((q, i) => (
              <div key={i} className={`rounded-xl p-3 text-center ${q.cls}`}>
                <p className="text-2xl font-bold">{q.value}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider mt-1">{q.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 h-2.5 rounded-full bg-gray-100 overflow-hidden flex">
            {queueStats.sent > 0 && <div className="bg-emerald-500" style={{ width: `${(queueStats.sent / queueTotal) * 100}%` }} />}
            {queueStats.processing > 0 && <div className="bg-blue-500" style={{ width: `${(queueStats.processing / queueTotal) * 100}%` }} />}
            {queueStats.pending > 0 && <div className="bg-amber-400" style={{ width: `${(queueStats.pending / queueTotal) * 100}%` }} />}
            {queueStats.failed > 0 && <div className="bg-red-500" style={{ width: `${(queueStats.failed / queueTotal) * 100}%` }} />}
          </div>
        </div>
      )}

      {/* ─── Recent Campaigns ────────────────────────────── */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Campaigns</h2>
          <Link to="/dashboard/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View All
            <TrendingUp size={16} />
          </Link>
        </div>
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns yet</h3>
            <p className="text-gray-600 mb-6">Create your first campaign to get started!</p>
            <Link
              to="/dashboard/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Zap size={20} />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left">
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs">Campaign</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-center">Status</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Sent</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Opened</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Clicked</th>
                  <th className="px-5 py-3 font-bold text-gray-500 uppercase tracking-wider text-xs text-right">Open Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentCampaigns.map((campaign) => {
                  const sent = campaign.stats?.sent || 0;
                  const opened = campaign.stats?.opened || 0;
                  const clicked = campaign.stats?.clicked || 0;
                  const or = sent > 0 ? ((opened / sent) * 100).toFixed(1) : '—';
                  return (
                    <tr key={campaign.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <Link to={`/campaigns/${campaign.id}`} className="hover:text-blue-600 transition-colors">
                          <div className="font-semibold text-gray-900">{campaign.name}</div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {campaign.createdAt ? format(new Date(campaign.createdAt), 'MMM dd, yyyy') : ''}
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          campaign.status === 'sent' ? 'bg-emerald-100 text-emerald-700' :
                          campaign.status === 'sending' ? 'bg-blue-100 text-blue-700' :
                          campaign.status === 'scheduled' ? 'bg-purple-100 text-purple-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {campaign.status === 'sent' && <CheckCircle2 size={10} />}
                          {campaign.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-semibold text-gray-900">{sent.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-semibold text-blue-600">{opened.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right font-semibold text-purple-600">{clicked.toLocaleString()}</td>
                      <td className="px-5 py-4 text-right">
                        <span className={`font-bold ${or !== '—' && parseFloat(or) >= 30 ? 'text-emerald-600' : or !== '—' && parseFloat(or) >= 15 ? 'text-amber-600' : 'text-gray-400'}`}>
                          {or !== '—' ? `${or}%` : or}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

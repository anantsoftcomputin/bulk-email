import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Send, Mail, TrendingUp, Eye, MousePointer, AlertCircle, Zap, BarChart3, Clock, CheckCircle2 } from 'lucide-react';
import Card from '../components/common/Card';
import { useCampaignStore } from '../store/campaignStore.db';
import { useContactStore } from '../store/contactStore.db';
import { format } from 'date-fns';

const Dashboard = () => {
  const { campaigns, initializeCampaigns } = useCampaignStore();
  const { contacts, initializeContacts } = useContactStore();
  
  useEffect(() => {
    initializeCampaigns();
    initializeContacts();
  }, []);
  
  // Calculate stats
  const totalCampaigns = campaigns.length;
  const activeCampaigns = campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length;
  const totalContacts = contacts.length;
  
  const totalEmailsSent = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
  
  const avgOpenRate = totalEmailsSent > 0 ? ((totalOpened / totalEmailsSent) * 100).toFixed(1) : 0;
  const avgClickRate = totalEmailsSent > 0 ? ((totalClicked / totalEmailsSent) * 100).toFixed(1) : 0;

  const stats = [
    {
      title: 'Total Contacts',
      value: totalContacts.toLocaleString(),
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      link: '/contacts',
      change: '+12%'
    },
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: Send,
      gradient: 'from-emerald-500 to-green-600',
      link: '/campaigns',
      change: '+8%'
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: Zap,
      gradient: 'from-purple-500 to-pink-600',
      link: '/campaigns',
      change: '+5%'
    },
    {
      title: 'Emails Sent',
      value: totalEmailsSent.toLocaleString(),
      icon: Mail,
      gradient: 'from-orange-500 to-red-600',
      link: '/analytics',
      change: '+23%'
    },
  ];

  const performanceStats = [
    {
      label: 'Open Rate',
      value: `${avgOpenRate}%`,
      icon: Eye,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Click Rate',
      value: `${avgClickRate}%`,
      icon: MousePointer,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-600 mt-2 font-medium">Welcome back! Here's what's happening today.</p>
        </div>
        <Link
          to="/campaigns/new"
          className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2"
        >
          <Zap size={20} />
          Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg hover:border-blue-200 transition-all duration-300 group h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Performance Stats */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {performanceStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center space-x-5">
                <div className={`w-16 h-16 ${stat.bgColor} rounded-2xl flex items-center justify-center`}>
                  <Icon className={`w-8 h-8 ${stat.color}`} strokeWidth={2.5} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-4xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Recent Campaigns</h2>
          <Link to="/campaigns" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
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
              to="/campaigns/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              <Zap size={20} />
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="block p-5 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mt-1 font-medium">{campaign.subject}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm mb-3 ${
                        campaign.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : campaign.status === 'sending'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : campaign.status === 'scheduled'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {campaign.status === 'sent' && <CheckCircle2 size={12} />}
                      {campaign.status}
                    </span>
                    {campaign.stats && (
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">Sent:</span>
                          <span className="font-bold text-gray-900">{campaign.stats.sent || 0}</span>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-gray-500">Opened:</span>
                          <span className="font-bold text-blue-600">{campaign.stats.opened || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

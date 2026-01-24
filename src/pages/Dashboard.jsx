import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Send, Mail, TrendingUp, Eye, MousePointer, AlertCircle } from 'lucide-react';
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
      color: 'bg-blue-500',
      link: '/contacts',
    },
    {
      title: 'Total Campaigns',
      value: totalCampaigns,
      icon: Send,
      color: 'bg-green-500',
      link: '/campaigns',
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns,
      icon: TrendingUp,
      color: 'bg-purple-500',
      link: '/campaigns',
    },
    {
      title: 'Emails Sent',
      value: totalEmailsSent.toLocaleString(),
      icon: Mail,
      color: 'bg-orange-500',
      link: '/analytics',
    },
  ];

  const performanceStats = [
    {
      label: 'Open Rate',
      value: `${avgOpenRate}%`,
      icon: Eye,
      color: 'text-blue-600',
    },
    {
      label: 'Click Rate',
      value: `${avgClickRate}%`,
      icon: MousePointer,
      color: 'text-green-600',
    },
  ];

  const recentCampaigns = campaigns.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/campaigns/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          Create Campaign
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Link key={index} to={stat.link}>
              <Card hover className="h-full">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-3 rounded-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Performance Stats */}
      <Card title="Performance Overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {performanceStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="flex items-center space-x-4">
                <Icon className={`w-8 h-8 ${stat.color}`} />
                <div>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent Campaigns */}
      <Card
        title="Recent Campaigns"
        action={
          <Link to="/campaigns" className="text-sm text-primary-600 hover:text-primary-700">
            View All
          </Link>
        }
      >
        {recentCampaigns.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No campaigns yet. Create your first campaign to get started!</p>
            <Link
              to="/campaigns/new"
              className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Create Campaign
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {recentCampaigns.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{campaign.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{campaign.subject}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="ml-4 text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : campaign.status === 'sending'
                          ? 'bg-blue-100 text-blue-800'
                          : campaign.status === 'scheduled'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {campaign.status}
                    </span>
                    {campaign.stats && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div>Sent: {campaign.stats.sent || 0}</div>
                        <div>Opened: {campaign.stats.opened || 0}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Dashboard;

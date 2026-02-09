import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCampaignStore } from '../store/campaignStore';
import { TrendingUp, Mail, Eye, MousePointer, AlertCircle, BarChart3 } from 'lucide-react';

const Analytics = () => {
  const { campaigns } = useCampaignStore();

  // Calculate overall stats
  const totalEmails = campaigns.reduce((sum, c) => sum + (c.stats?.sent || 0), 0);
  const totalOpened = campaigns.reduce((sum, c) => sum + (c.stats?.opened || 0), 0);
  const totalClicked = campaigns.reduce((sum, c) => sum + (c.stats?.clicked || 0), 0);
  const totalBounced = campaigns.reduce((sum, c) => sum + (c.stats?.bounced || 0), 0);

  const openRate = totalEmails > 0 ? ((totalOpened / totalEmails) * 100).toFixed(1) : 0;
  const clickRate = totalEmails > 0 ? ((totalClicked / totalEmails) * 100).toFixed(1) : 0;
  const bounceRate = totalEmails > 0 ? ((totalBounced / totalEmails) * 100).toFixed(1) : 0;

  const stats = [
    {
      label: 'Total Sent',
      value: totalEmails.toLocaleString(),
      icon: Mail,
      gradient: 'from-blue-500 to-indigo-600',
    },
    {
      label: 'Open Rate',
      value: `${openRate}%`,
      icon: Eye,
      gradient: 'from-emerald-500 to-teal-600',
    },
    {
      label: 'Click Rate',
      value: `${clickRate}%`,
      icon: MousePointer,
      gradient: 'from-purple-500 to-pink-600',
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate}%`,
      icon: AlertCircle,
      gradient: 'from-red-500 to-rose-600',
    },
  ];

  // Prepare chart data
  const campaignData = campaigns.slice(0, 10).map(c => ({
    name: c.name.substring(0, 15),
    sent: c.stats?.sent || 0,
    opened: c.stats?.opened || 0,
    clicked: c.stats?.clicked || 0,
  }));

  const statusData = [
    { name: 'Delivered', value: totalEmails - totalBounced },
    { name: 'Opened', value: totalOpened },
    { name: 'Clicked', value: totalClicked },
    { name: 'Bounced', value: totalBounced },
  ];

  const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#ef4444'];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Reports</h1>
        <p className="text-gray-600 mt-2 font-medium">Track your email campaign performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.gradient} rounded-2xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Campaign Performance</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
              <Legend />
              <Bar dataKey="sent" fill="#3b82f6" name="Sent" radius={[8, 8, 0, 0]} />
              <Bar dataKey="opened" fill="#10b981" name="Opened" radius={[8, 8, 0, 0]} />
              <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Email Status Distribution</h2>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

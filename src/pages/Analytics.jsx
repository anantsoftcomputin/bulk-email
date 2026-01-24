import React from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/common/Card';
import { useCampaignStore } from '../store/campaignStore';
import { TrendingUp, Mail, Eye, MousePointer, AlertCircle } from 'lucide-react';

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
      color: 'bg-blue-500',
    },
    {
      label: 'Open Rate',
      value: `${openRate}%`,
      icon: Eye,
      color: 'bg-green-500',
    },
    {
      label: 'Click Rate',
      value: `${clickRate}%`,
      icon: MousePointer,
      color: 'bg-purple-500',
    },
    {
      label: 'Bounce Rate',
      value: `${bounceRate}%`,
      icon: AlertCircle,
      color: 'bg-red-500',
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Campaign Performance">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sent" fill="#3b82f6" name="Sent" />
              <Bar dataKey="opened" fill="#10b981" name="Opened" />
              <Bar dataKey="clicked" fill="#8b5cf6" name="Clicked" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Email Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

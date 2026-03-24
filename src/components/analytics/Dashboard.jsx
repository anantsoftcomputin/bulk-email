import React from 'react';
import { Send, Users, Inbox } from 'lucide-react';

const KPICard = ({ label, value, icon: Icon, iconBg, iconColor }) => (
  <div className="stat-card">
    <div className={`icon-box ${iconBg} mb-3`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
  </div>
);

const AnalyticsDashboard = ({ campaigns = [], contacts = [], queueStats = {} }) => {
  const totalCampaigns = campaigns.length;
  const activeContacts = contacts.filter(c => c.status === 'active').length;
  const inQueue = (queueStats.pending || 0) + (queueStats.processing || 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <KPICard
        label="Total Campaigns"
        value={totalCampaigns}
        icon={Send}
        iconBg="bg-indigo-50"
        iconColor="text-indigo-600"
      />
      <KPICard
        label="Active Contacts"
        value={activeContacts}
        icon={Users}
        iconBg="bg-emerald-50"
        iconColor="text-emerald-600"
      />
      <KPICard
        label="Emails in Queue"
        value={inQueue}
        icon={Inbox}
        iconBg="bg-amber-50"
        iconColor="text-amber-600"
      />
    </div>
  );
};

export default AnalyticsDashboard;

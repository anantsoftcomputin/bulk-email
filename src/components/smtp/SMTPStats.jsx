import React from 'react';
import { Send, XCircle, AlertCircle, Clock } from 'lucide-react';

const SMTPStats = ({ stats = {} }) => {
  const { sent = 0, failed = 0, bounced = 0, avgDeliveryTime = null } = stats;

  const items = [
    { label: 'Sent',           value: sent.toLocaleString(),    icon: Send,          iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Failed',         value: failed.toLocaleString(),  icon: XCircle,       iconBg: 'bg-rose-50',    iconColor: 'text-rose-600' },
    { label: 'Bounced',        value: bounced.toLocaleString(), icon: AlertCircle,   iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
    { label: 'Avg Delivery',   value: avgDeliveryTime ? `${avgDeliveryTime}ms` : 'N/A', icon: Clock, iconBg: 'bg-sky-50', iconColor: 'text-sky-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(s => {
        const Icon = s.icon;
        return (
          <div key={s.label} className="stat-card">
            <div className={`icon-box ${s.iconBg} mb-3`}>
              <Icon className={`w-5 h-5 ${s.iconColor}`} />
            </div>
            <p className="text-2xl font-semibold text-gray-900 tabular-nums">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        );
      })}
    </div>
  );
};

export default SMTPStats;

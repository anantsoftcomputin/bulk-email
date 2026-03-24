import React from 'react';
import { Users, UserCheck, UserX, Mail } from 'lucide-react';

const GroupStats = ({ group }) => {
  const total = group?.contactCount ?? 0;
  const active = group?.activeCount ?? 0;
  const unsubscribed = group?.unsubscribedCount ?? 0;
  const openRate = group?.openRate ?? null;

  const stats = [
    { label: 'Total Contacts', value: total.toLocaleString(), icon: Users, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
    { label: 'Active', value: active.toLocaleString(), icon: UserCheck, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Unsubscribed', value: unsubscribed.toLocaleString(), icon: UserX, iconBg: 'bg-rose-50', iconColor: 'text-rose-600' },
    { label: 'Open Rate', value: openRate !== null ? `${openRate.toFixed(1)}%` : 'N/A', icon: Mail, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map(s => {
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

export default GroupStats;

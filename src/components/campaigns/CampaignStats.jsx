import React from 'react';
import { Send, CheckCircle2, Eye, MousePointer, AlertCircle, XCircle } from 'lucide-react';

const StatItem = ({ label, value, pct, icon: Icon, iconBg, iconColor }) => (
  <div className="stat-card">
    <div className="flex items-start justify-between mb-2">
      <div className={`icon-box ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      {pct !== undefined && (
        <span className="text-xs font-semibold text-gray-400">{pct.toFixed(1)}%</span>
      )}
    </div>
    <p className="text-2xl font-semibold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
    <p className="text-xs text-gray-500 mt-1">{label}</p>
    {pct !== undefined && (
      <div className="mt-2 h-1.5 bg-surface-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${iconBg.replace('50', '400')}`}
          style={{ width: `${Math.min(pct, 100)}%`, transition: 'width 0.4s ease' }}
        />
      </div>
    )}
  </div>
);

const CampaignStats = ({ campaign }) => {
  const stats = campaign?.stats || {};
  const sent = stats.sent || 0;
  const delivered = stats.delivered || 0;
  const opened = stats.opened || 0;
  const clicked = stats.clicked || 0;
  const bounced = stats.bounced || 0;
  const failed = stats.failed || 0;

  const pct = (n) => (sent > 0 ? (n / sent) * 100 : 0);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <StatItem label="Sent"      value={sent}      icon={Send}        iconBg="bg-indigo-50"  iconColor="text-indigo-600" />
      <StatItem label="Delivered" value={delivered} pct={pct(delivered)} icon={CheckCircle2} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      <StatItem label="Opened"    value={opened}    pct={pct(opened)}    icon={Eye}         iconBg="bg-sky-50"     iconColor="text-sky-600" />
      <StatItem label="Clicked"   value={clicked}   pct={pct(clicked)}   icon={MousePointer} iconBg="bg-amber-50"  iconColor="text-amber-600" />
      <StatItem label="Bounced"   value={bounced}   pct={pct(bounced)}   icon={AlertCircle} iconBg="bg-orange-50" iconColor="text-orange-600" />
      <StatItem label="Failed"    value={failed}    pct={pct(failed)}    icon={XCircle}     iconBg="bg-rose-50"   iconColor="text-rose-600" />
    </div>
  );
};

export default CampaignStats;

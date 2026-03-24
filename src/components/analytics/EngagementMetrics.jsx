import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Eye, MousePointer, ArrowUpDown, UserX } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { subDays, startOfDay, isAfter, parseISO } from 'date-fns';

const MetricCard = ({ label, value, trend, icon: Icon, iconBg, iconColor, sparkData }) => {
  const isUp = trend >= 0;
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-1">
        <div className={`icon-box ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        {trend !== null && (
          <span className={`flex items-center gap-0.5 text-xs font-semibold ${
            isUp ? 'text-emerald-600' : 'text-rose-600'
          }`}>
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-semibold text-gray-900 tabular-nums mt-2">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sparkData && sparkData.length > 0 && (
        <div className="mt-2 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Area type="monotone" dataKey="v" stroke={iconColor.replace('text-', '#').replace('-600', '')} fill={iconBg.replace('bg-', '#').replace('-50', '')} strokeWidth={1.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

const EngagementMetrics = ({ campaigns = [], trackingEvents = [], dateRange = 30 }) => {
  const metrics = useMemo(() => {
    const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
    const totalOpened = campaigns.reduce((s, c) => s + (c.stats?.opened || 0), 0);
    const totalClicked = campaigns.reduce((s, c) => s + (c.stats?.clicked || 0), 0);
    const totalUnsubscribed = campaigns.reduce((s, c) => s + (c.stats?.unsubscribed || 0), 0);

    const openRate = totalSent > 0 ? (totalOpened / totalSent) * 100 : 0;
    const clickRate = totalSent > 0 ? (totalClicked / totalSent) * 100 : 0;
    const cto = totalOpened > 0 ? (totalClicked / totalOpened) * 100 : 0;
    const unsubRate = totalSent > 0 ? (totalUnsubscribed / totalSent) * 100 : 0;

    // Build daily sparkline data (last 14 points)
    const opens = trackingEvents.filter(e => e.type === 'open');
    const clicks = trackingEvents.filter(e => e.type === 'click');
    const sparkOpens = [];
    const sparkClicks = [];
    for (let i = 13; i >= 0; i--) {
      const dayStart = startOfDay(subDays(new Date(), i));
      const dayEnd = startOfDay(subDays(new Date(), i - 1));
      const filter = arr => arr.filter(e => {
        const d = new Date(e.timestamp || e.createdAt || 0);
        return isAfter(d, dayStart) && !isAfter(d, dayEnd);
      }).length;
      sparkOpens.push({ v: filter(opens) });
      sparkClicks.push({ v: filter(clicks) });
    }

    return [
      { label: 'Open Rate',          value: `${openRate.toFixed(1)}%`,   trend: null, icon: Eye,          iconBg: 'bg-sky-50',     iconColor: 'text-sky-600',     spark: sparkOpens },
      { label: 'Click Rate',         value: `${clickRate.toFixed(1)}%`,  trend: null, icon: MousePointer, iconBg: 'bg-amber-50',   iconColor: 'text-amber-600',   spark: sparkClicks },
      { label: 'Click-to-Open Rate', value: `${cto.toFixed(1)}%`,        trend: null, icon: ArrowUpDown,  iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600',  spark: null },
      { label: 'Unsubscribe Rate',   value: `${unsubRate.toFixed(2)}%`,  trend: null, icon: UserX,        iconBg: 'bg-rose-50',    iconColor: 'text-rose-600',    spark: null },
    ];
  }, [campaigns, trackingEvents, dateRange]);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map(m => (
        <MetricCard key={m.label} label={m.label} value={m.value} trend={m.trend} icon={m.icon} iconBg={m.iconBg} iconColor={m.iconColor} sparkData={m.spark} />
      ))}
    </div>
  );
};

export default EngagementMetrics;

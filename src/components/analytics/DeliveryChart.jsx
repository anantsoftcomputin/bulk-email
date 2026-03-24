import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const DeliveryChart = ({ campaigns = [], dateRange = 30 }) => {
  const data = useMemo(() => {
    return campaigns
      .filter(c => c.stats && (c.stats.sent || 0) > 0)
      .slice(0, 10)
      .map(c => ({
        name: (c.name?.length > 15 ? c.name.slice(0, 15) + '\u2026' : c.name) || 'Unnamed',
        sent:    c.stats?.sent      || 0,
        opened:  c.stats?.opened    || 0,
        clicked: c.stats?.clicked   || 0,
        failed:  c.stats?.failed    || 0,
      }));
  }, [campaigns, dateRange]);

  if (data.length === 0) {
    return (
      <div className="card flex items-center justify-center h-48 text-sm text-gray-400">
        No campaign data to display
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-4">Campaign Delivery</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" interval={0} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
          />
          <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
          <Bar dataKey="sent"    name="Sent"    fill="#6366f1" radius={[3, 3, 0, 0]} />
          <Bar dataKey="opened"  name="Opened"  fill="#10b981" radius={[3, 3, 0, 0]} />
          <Bar dataKey="clicked" name="Clicked" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          <Bar dataKey="failed"  name="Failed"  fill="#ef4444" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DeliveryChart;

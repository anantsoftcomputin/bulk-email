import React from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ef4444', '#f59e0b'];

const EmailStats = ({ stats = {} }) => {
  const { sent = 0, delivered = 0, opened = 0, clicked = 0, bounced = 0, failed = 0 } = stats;

  const data = [
    { name: 'Delivered', value: delivered },
    { name: 'Opened',    value: opened },
    { name: 'Clicked',   value: clicked },
    { name: 'Bounced',   value: bounced },
    { name: 'Failed',    value: failed },
  ].filter(d => d.value > 0);

  const display = data.length > 0 ? data : [{ name: 'No Data', value: 1 }];
  const noData = data.length === 0;

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 mb-1">Email Status Distribution</h3>
      <p className="text-xs text-gray-400 mb-4">{sent.toLocaleString()} total sent</p>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={display}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={2}
            dataKey="value"
          >
            {display.map((entry, i) => (
              <Cell key={entry.name} fill={noData ? '#e5e7eb' : COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          {!noData && (
            <Tooltip
              formatter={(v, name) => [
                `${v.toLocaleString()} (${sent > 0 ? ((v / sent) * 100).toFixed(1) : 0}%)`,
                name,
              ]}
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb' }}
            />
          )}
          <Legend wrapperStyle={{ fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EmailStats;

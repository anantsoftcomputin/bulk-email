import { useState, useEffect } from 'react';
import { db } from '../db/database';
import { subDays, startOfDay, isAfter } from 'date-fns';

export const useAnalytics = (campaignId = null) => {
  const [stats, setStats] = useState({
    totalOpens: 0,
    totalClicks: 0,
    openRate: 0,
    clickRate: 0,
    dailyActivity: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        let events = await db.trackingEvents.toArray();
        let campaigns = await db.campaigns.toArray();

        if (campaignId) {
          events = events.filter(e => e.campaignId === campaignId);
          campaigns = campaigns.filter(c => c.id === campaignId);
        }

        const totalSent = campaigns.reduce((s, c) => s + (c.stats?.sent || 0), 0);
        const opens = events.filter(e => e.type === 'open');
        const clicks = events.filter(e => e.type === 'click');
        const totalOpens = opens.length;
        const totalClicks = clicks.length;

        const openRate = totalSent > 0 ? (totalOpens / totalSent) * 100 : 0;
        const clickRate = totalSent > 0 ? (totalClicks / totalSent) * 100 : 0;

        // Build last 30 days of daily activity
        const dailyActivity = [];
        for (let i = 29; i >= 0; i--) {
          const dayStart = startOfDay(subDays(new Date(), i));
          const dayEnd = startOfDay(subDays(new Date(), i - 1));
          const dayOpens = opens.filter(e => {
            const d = new Date(e.timestamp || e.createdAt || 0);
            return isAfter(d, dayStart) && !isAfter(d, dayEnd);
          }).length;
          const dayClicks = clicks.filter(e => {
            const d = new Date(e.timestamp || e.createdAt || 0);
            return isAfter(d, dayStart) && !isAfter(d, dayEnd);
          }).length;
          dailyActivity.push({
            date: dayStart.toISOString().slice(0, 10),
            opens: dayOpens,
            clicks: dayClicks,
          });
        }

        setStats({ totalOpens, totalClicks, openRate, clickRate, dailyActivity });
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [campaignId]);

  return { stats, isLoading, error };
};

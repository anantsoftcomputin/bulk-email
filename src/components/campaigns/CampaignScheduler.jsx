import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { format, parseISO, isAfter } from 'date-fns';

const CampaignScheduler = ({ value, onChange, minDate }) => {
  const now = new Date();
  const minISO = (minDate ? new Date(minDate) : now).toISOString().slice(0, 10);

  // Parse existing value
  const parsedDate = value ? value.slice(0, 10) : '';
  const parsedTime = value ? value.slice(11, 16) : '09:00';

  const [date, setDate] = useState(parsedDate);
  const [time, setTime] = useState(parsedTime);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!date || !time) {
      onChange('');
      setError('');
      return;
    }
    const iso = `${date}T${time}:00`;
    const selected = new Date(iso);
    if (!isAfter(selected, now)) {
      setError('Scheduled time must be in the future');
      onChange('');
    } else {
      setError('');
      onChange(iso);
    }
  }, [date, time]);

  const humanReadable = date && time && !error
    ? format(parseISO(`${date}T${time}:00`), "EEEE, MMM d 'at' h:mm a")
    : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <Calendar size={12} className="inline mr-1" />Date
          </label>
          <input
            type="date"
            value={date}
            min={minISO}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            <Clock size={12} className="inline mr-1" />Time
          </label>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-surface-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-300"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600">
          <AlertCircle size={12} />{error}
        </div>
      )}

      {humanReadable && (
        <div className="flex items-center gap-1.5 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">
          <Calendar size={12} />
          Scheduled for <span className="font-semibold ml-1">{humanReadable}</span>
        </div>
      )}
    </div>
  );
};

export default CampaignScheduler;

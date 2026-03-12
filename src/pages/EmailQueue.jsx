import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Play, Pause, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';
import { db, dbHelpers } from '../db/database';
import emailQueueService from '../services/emailQueue';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EmailQueue = () => {
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    sent: 0,
    failed: 0,
  });
  const [queueItems, setQueueItems] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, processing, sent, failed
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadQueueData();
    const interval = setInterval(loadQueueData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [filter]);

  const loadQueueData = async () => {
    try {
      const queueStats = await dbHelpers.getEmailQueueStats();
      setStats(queueStats);
      setIsProcessing(emailQueueService.isProcessing);

      // Load queue items based on filter
      let items = [];
      if (filter === 'all') {
        items = await db.emailQueue.orderBy('scheduledAt').reverse().limit(100).toArray();
      } else {
        items = await db.emailQueue.where('status').equals(filter).orderBy('scheduledAt').reverse().limit(100).toArray();
      }

      // Enhance items with contact info
      const enhancedItems = await Promise.all(items.map(async (item) => {
        const contact = await db.contacts.get(item.contactId);
        const campaign = await db.campaigns.get(item.campaignId);
        return {
          ...item,
          contactEmail: contact?.email || 'Unknown',
          contactName: `${contact?.firstName || ''} ${contact?.lastName || ''}`.trim() || 'Unknown',
          campaignName: campaign?.name || 'Unknown Campaign',
        };
      }));

      setQueueItems(enhancedItems);
    } catch (error) {
      console.error('Error loading queue data:', error);
    }
  };

  const handlePauseResume = () => {
    if (isProcessing) {
      emailQueueService.stopProcessing();
      toast.success('Email queue paused');
    } else {
      emailQueueService.startProcessing();
      toast.success('Email queue resumed');
    }
    setIsProcessing(!isProcessing);
  };

  const handleRetryFailed = async () => {
    try {
      const failedItems = await db.emailQueue.where('status').equals('failed').toArray();
      
      for (const item of failedItems) {
        await dbHelpers.updateEmailQueueStatus(item.id, 'pending', null, 0);
      }
      
      toast.success(`${failedItems.length} failed emails reset to pending`);
      loadQueueData();
    } catch (error) {
      console.error('Error retrying failed emails:', error);
      toast.error('Failed to retry emails');
    }
  };

  const handleClearSent = async () => {
    if (!confirm('Are you sure you want to clear all sent emails from the queue?')) {
      return;
    }

    try {
      await db.emailQueue.where('status').equals('sent').delete();
      toast.success('Sent emails cleared');
      loadQueueData();
    } catch (error) {
      console.error('Error clearing sent emails:', error);
      toast.error('Failed to clear sent emails');
    }
  };

  const handleClearFailed = async () => {
    if (!confirm('Are you sure you want to clear all failed emails from the queue?')) {
      return;
    }

    try {
      await db.emailQueue.where('status').equals('failed').delete();
      toast.success('Failed emails cleared');
      loadQueueData();
    } catch (error) {
      console.error('Error clearing failed emails:', error);
      toast.error('Failed to clear failed emails');
    }
  };

  const columns = [
    {
      header: 'Contact',
      render: (row) => (
        <div>
          <div className="font-medium">{row.contactName}</div>
          <div className="text-sm text-gray-500">{row.contactEmail}</div>
        </div>
      ),
    },
    {
      header: 'Campaign',
      render: (row) => row.campaignName,
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
            row.status === 'sent'
              ? 'bg-green-100 text-green-800'
              : row.status === 'processing'
              ? 'bg-blue-100 text-blue-800'
              : row.status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status === 'sent' && <CheckCircle className="w-3 h-3" />}
          {row.status === 'failed' && <XCircle className="w-3 h-3" />}
          {row.status === 'pending' && <Clock className="w-3 h-3" />}
          {row.status}
        </span>
      ),
    },
    {
      header: 'Priority',
      render: (row) => (
        <span className={`text-sm ${row.priority === 'high' ? 'text-red-600 font-semibold' : row.priority === 'normal' ? 'text-blue-600' : 'text-gray-600'}`}>
          {row.priority}
        </span>
      ),
    },
    {
      header: 'Scheduled',
      render: (row) => format(new Date(row.scheduledAt), 'MMM dd, HH:mm:ss'),
    },
    {
      header: 'Sent At',
      render: (row) => row.sentAt ? format(new Date(row.sentAt), 'MMM dd, HH:mm:ss') : '-',
    },
    {
      header: 'Retries',
      render: (row) => row.retryCount || 0,
    },
    {
      header: 'Error',
      render: (row) => row.error ? (
        <span className="text-xs text-red-600 max-w-xs truncate" title={row.error}>
          {row.error}
        </span>
      ) : '-',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Email Queue</h1>
          <p className="page-subtitle">Monitor and manage outgoing email delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={loadQueueData}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium border border-surface-200 rounded-lg text-gray-600 hover:bg-surface-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={handlePauseResume}
            className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              isProcessing
                ? 'border border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'
                : 'btn-primary'
            }`}
          >
            {isProcessing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isProcessing ? 'Pause Queue' : 'Resume Queue'}
          </button>
        </div>
      </div>

      {/* Processing Notice */}
      {isProcessing && stats.pending > 0 && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Keep This Tab Open</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Processing <strong>{stats.pending} pending emails</strong> at 300/hr. Estimated: <strong>{Math.ceil(stats.pending / 5)} min</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pending',    value: stats.pending,    icon: Clock,       iconBg: 'bg-amber-50',   iconColor: 'text-amber-500'  },
          { label: 'Processing', value: stats.processing,  icon: RefreshCw,   iconBg: 'bg-blue-50',    iconColor: 'text-blue-500', spin: stats.processing > 0 },
          { label: 'Sent',       value: stats.sent,        icon: CheckCircle, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-500'},
          { label: 'Failed',     value: stats.failed,      icon: XCircle,     iconBg: 'bg-rose-50',    iconColor: 'text-rose-500'  },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`icon-box ${s.iconBg} mb-3`}>
                <Icon className={`w-5 h-5 ${s.iconColor} ${s.spin ? 'animate-spin' : ''}`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Queue Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={handleRetryFailed}
          disabled={stats.failed === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-surface-200 rounded-lg text-gray-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry All Failed
        </button>
        <button
          onClick={handleClearSent}
          disabled={stats.sent === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-surface-200 rounded-lg text-gray-600 hover:bg-surface-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Sent
        </button>
        <button
          onClick={handleClearFailed}
          disabled={stats.failed === 0}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-rose-200 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Failed
        </button>
      </div>

      {/* Filter + Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center gap-1.5 p-4 border-b border-surface-100">
          {['all', 'pending', 'processing', 'sent', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors capitalize ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-500 hover:bg-surface-50'
              }`}
            >
              {status}
              {status !== 'all' && ` (${stats[status] || 0})`}
            </button>
          ))}
        </div>

        <div className="overflow-x-auto">
          {queueItems.length === 0 ? (
            <div className="py-16 text-center">
              <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No emails in queue</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contact</th>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Scheduled</th>
                  <th>Sent At</th>
                  <th>Retries</th>
                  <th>Error</th>
                </tr>
              </thead>
              <tbody>
                {queueItems.map((row, i) => (
                  <tr key={row.id || i}>
                    <td>
                      <p className="font-medium text-gray-900">{row.contactName}</p>
                      <p className="text-xs text-gray-400">{row.contactEmail}</p>
                    </td>
                    <td className="text-gray-700">{row.campaignName}</td>
                    <td>
                      <span className={`badge ${
                        row.status === 'sent'       ? 'badge-sent' :
                        row.status === 'processing' ? 'badge-sending' :
                        row.status === 'failed'     ? 'badge-failed' :
                        'badge-draft'
                      } capitalize`}>
                        {row.status === 'sent'       && <CheckCircle className="w-3 h-3" />}
                        {row.status === 'failed'     && <XCircle className="w-3 h-3" />}
                        {row.status === 'pending'    && <Clock className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span className={`text-xs font-medium ${
                        row.priority === 'high'   ? 'text-rose-600' :
                        row.priority === 'normal' ? 'text-blue-600' :
                        'text-gray-500'
                      }`}>{row.priority}</span>
                    </td>
                    <td className="text-xs text-gray-500">{format(new Date(row.scheduledAt), 'MMM dd, HH:mm')}</td>
                    <td className="text-xs text-gray-500">{row.sentAt ? format(new Date(row.sentAt), 'MMM dd, HH:mm') : '—'}</td>
                    <td className="text-xs text-gray-500 text-center">{row.retryCount || 0}</td>
                    <td className="text-xs text-rose-500 max-w-[160px] truncate" title={row.error}>{row.error || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailQueue;

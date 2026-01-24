import React, { useState, useEffect } from 'react';
import { RefreshCw, Trash2, Play, Pause, CheckCircle, XCircle, Clock } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Email Queue</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadQueueData}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant={isProcessing ? 'outline' : 'primary'}
            onClick={handlePauseResume}
            icon={isProcessing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          >
            {isProcessing ? 'Pause Queue' : 'Resume Queue'}
          </Button>

      {/* Important Notice for Large Queues */}
      {isProcessing && stats.pending > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 mb-1">Keep This Browser Tab Open</h3>
            <p className="text-sm text-amber-800">
              Queue is processing <strong>{stats.pending} pending emails</strong> at <strong>300 emails/hour</strong>. 
              Estimated time: <strong>{Math.ceil(stats.pending / 5)} minutes</strong>. 
              Do not close this tab until processing completes.
            </p>
          </div>
        </div>
      )}
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <Clock className="w-12 h-12 text-gray-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Processing</p>
              <p className="text-3xl font-bold text-blue-600">{stats.processing}</p>
            </div>
            <RefreshCw className={`w-12 h-12 text-blue-400 ${stats.processing > 0 ? 'animate-spin' : ''}`} />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sent</p>
              <p className="text-3xl font-bold text-green-600">{stats.sent}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-400" />
          </div>
        </Card>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <XCircle className="w-12 h-12 text-red-400" />
          </div>
        </Card>
      </div>

      {/* Queue Management Actions */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={handleRetryFailed}
            disabled={stats.failed === 0}
          >
            Retry All Failed
          </Button>
          <Button
            variant="outline"
            onClick={handleClearSent}
            disabled={stats.sent === 0}
          >
            Clear Sent
          </Button>
          <Button
            variant="outline"
            onClick={handleClearFailed}
            disabled={stats.failed === 0}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            Clear Failed
          </Button>
        </div>
      </Card>

      {/* Filter Tabs */}
      <Card>
        <div className="flex gap-2 mb-4">
          {['all', 'pending', 'processing', 'sent', 'failed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
              {status !== 'all' && ` (${stats[status] || 0})`}
            </button>
          ))}
        </div>

        <Table
          columns={columns}
          data={queueItems}
          emptyMessage="No emails in queue"
        />
      </Card>
    </div>
  );
};

export default EmailQueue;

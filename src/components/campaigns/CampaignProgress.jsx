import React, { useState, useEffect } from 'react';
import { X, Mail, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import emailQueueService from '../../services/emailQueue';

const CampaignProgress = ({ campaignId, onClose }) => {
  const [progress, setProgress] = useState({
    status: 'idle',
    currentEmail: '',
    totalEmails: 0,
    sentEmails: 0,
    percentage: 0,
    error: null
  });

  useEffect(() => {
    // Subscribe to progress updates
    const unsubscribe = emailQueueService.onProgress((data) => {
      setProgress(data);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'sending':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (progress.status) {
      case 'sending':
        return 'Sending emails...';
      case 'success':
        return 'Emails sent successfully!';
      case 'error':
        return 'Error sending email';
      default:
        return 'Preparing to send...';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Campaign Progress</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2  text-sm">
            <span className="text-gray-600">
              {progress.sentEmails} / {progress.totalEmails} emails sent
            </span>
            <span className="font-semibold text-gray-900">
              {progress.percentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                progress.status === 'error'
                  ? 'bg-red-500'
                  : progress.percentage === 100
                  ? 'bg-green-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${progress.percentage}%` }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-4">
          {getStatusIcon()}
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{getStatusText()}</p>
            {progress.currentEmail && (
              <p className="text-xs text-gray-600 mt-1 truncate">
                Current: {progress.currentEmail}
              </p>
            )}
            {progress.error && (
              <p className="text-xs text-red-600 mt-1">
                {progress.error}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{progress.totalEmails}</p>
            <p className="text-xs text-gray-600 mt-1">Total</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{progress.sentEmails}</p>
            <p className="text-xs text-gray-600 mt-1">Sent</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-600">
              {progress.totalEmails - progress.sentEmails}
            </p>
            <p className="text-xs text-gray-600 mt-1">Remaining</p>
          </div>
        </div>

        {/* Actions */}
        {progress.percentage === 100 && (
          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Done
          </button>
        )}
      </div>
    </div>
  );
};

export default CampaignProgress;

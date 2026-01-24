import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Send, AlertCircle, CheckCircle, Server } from 'lucide-react';
import toast from 'react-hot-toast';
import emailAPI from '../../api/emailAPI';

const SMTPTestModal = ({ isOpen, onClose, smtpConfig }) => {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(null);

  React.useEffect(() => {
    if (isOpen) {
      checkBackend();
    }
  }, [isOpen]);

  const checkBackend = async () => {
    try {
      await emailAPI.checkHealth();
      setBackendAvailable(true);
    } catch (error) {
      setBackendAvailable(false);
    }
  };

  const handleTest = async () => {
    if (!testEmail) {
      toast.error('Please enter a test email address');
      return;
    }

    if (!backendAvailable) {
      toast.error('Backend server is not running. Please start it first.');
      return;
    }

    setTesting(true);

    try {
      const result = await emailAPI.testSMTP(smtpConfig, testEmail);
      
      if (result.success) {
        toast.success('Test email sent successfully! Check your inbox.');
        onClose();
      } else {
        toast.error(result.error || 'Failed to send test email');
      }
    } catch (error) {
      console.error('Test email error:', error);
      toast.error(error.message || 'Failed to send test email');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Test SMTP Configuration"
      size="md"
    >
      <div className="space-y-6">
        {/* Backend Status */}
        {backendAvailable === false && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Server className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-medium mb-1">Backend Server Not Running</p>
                <p className="mb-2">
                  The backend API server is not available. To send real emails:
                </p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Open a new terminal</li>
                  <li>Navigate to: <code className="bg-red-100 px-1 rounded">cd server</code></li>
                  <li>Install dependencies: <code className="bg-red-100 px-1 rounded">npm install</code></li>
                  <li>Start server: <code className="bg-red-100 px-1 rounded">npm run dev</code></li>
                </ol>
                <p className="mt-2">Server should run on: <strong>http://localhost:3001</strong></p>
              </div>
            </div>
          </div>
        )}

        {backendAvailable && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">✓ Backend Server Connected</p>
                <p>Ready to send test emails via SMTP</p>
              </div>
            </div>
          </div>
        )}

        {/* Important Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">How It Works</p>
              <p>
                Test emails are sent through the Node.js backend server using Nodemailer. 
                The backend handles SMTP connections securely and returns the result.
              </p>
            </div>
          </div>
        </div>

        {/* Current Configuration Display */}
        {smtpConfig && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <h4 className="font-medium text-gray-900">Current Configuration:</h4>
            <div className="grid grid-cols-2 gap-2">
              <div className="text-gray-600">Host:</div>
              <div className="font-medium">{smtpConfig.host}</div>
              <div className="text-gray-600">Port:</div>
              <div className="font-medium">{smtpConfig.port}</div>
              <div className="text-gray-600">Secure:</div>
              <div className="font-medium">{smtpConfig.secure ? 'Yes (TLS/SSL)' : 'No'}</div>
              <div className="text-gray-600">From Email:</div>
              <div className="font-medium">{smtpConfig.fromEmail}</div>
            </div>
          </div>
        )}

        {/* Test Email Input */}
        <Input
          label="Test Email Address"
          type="email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          placeholder="your-email@example.com"
          help="Enter the email address where you want to receive the test email"
        />

        {/* Backend Implementation Guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">Backend Server Details:</p>
            <ul className="space-y-1 text-xs">
              <li>• Location: <code className="bg-gray-200 px-1 rounded">/server</code></li>
              <li>• Technology: Node.js + Express + Nodemailer</li>
              <li>• Port: 3001</li>
              <li>• Supports: Gmail, Outlook, Custom SMTP</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleTest}
            disabled={testing || !testEmail || !backendAvailable}
            icon={<Send className="w-4 h-4" />}
          >
            {testing ? 'Sending...' : 'Send Test Email'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SMTPTestModal;

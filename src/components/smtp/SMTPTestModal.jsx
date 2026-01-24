import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Send, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import emailAPI from '../../api/emailAPI';

const SMTPTestModal = ({ isOpen, onClose, smtpConfig }) => {
  const [testEmail, setTestEmail] = useState('');
  const [testing, setTesting] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState(true);

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
        {backendAvailable && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-medium">✓ Email Service Ready</p>
                <p>Powered by Netlify Functions - ready to send test emails via SMTP</p>
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
                Test emails are sent through serverless functions using Nodemailer. 
                Your SMTP credentials are used securely to send the test email.
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

        {/* Action Buttons */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleTest}
            disabled={testing || !testEmail}
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

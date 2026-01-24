import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Server, Mail, Lock, CheckCircle } from 'lucide-react';
import { SMTP_PROVIDERS } from '../../utils/constants';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

export const SMTPConfigForm = ({ config, onSave, onClose }) => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: config || {
      name: '',
      provider: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      username: '',
      password: '',
      fromName: '',
      fromEmail: '',
      dailyLimit: 500,
      hourlyLimit: 50,
      isActive: true
    }
  });

  const selectedProvider = watch('provider');

  const handleProviderChange = (provider) => {
    const providerConfig = SMTP_PROVIDERS.find(p => p.name === provider);
    if (providerConfig) {
      setValue('host', providerConfig.host);
      setValue('port', providerConfig.port);
      setValue('secure', providerConfig.secure);
    }
  };

  const testConnection = async (data) => {
    setTesting(true);
    setTestResult(null);

    try {
      // Simulate API call to test SMTP
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock test result
      const success = Math.random() > 0.3;
      
      if (success) {
        setTestResult({ success: true, message: 'Connection successful!' });
        toast.success('SMTP connection test passed');
      } else {
        setTestResult({ success: false, message: 'Authentication failed' });
        toast.error('SMTP connection test failed');
      }
    } catch (error) {
      setTestResult({ success: false, message: error.message });
      toast.error('Test failed: ' + error.message);
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = (data) => {
    onSave({ ...data, id: config?.id || Date.now().toString() });
    toast.success(config ? 'SMTP config updated' : 'SMTP config added');
    onClose();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Basic Information</h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Configuration Name *
          </label>
          <input
            {...register('name', { required: 'Name is required' })}
            placeholder="e.g., Primary Gmail"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Provider
          </label>
          <select
            {...register('provider')}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          >
            {SMTP_PROVIDERS.map(provider => (
              <option key={provider.name} value={provider.name}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Server Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Server size={18} />
          Server Settings
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host *
            </label>
            <input
              {...register('host', { required: 'Host is required' })}
              placeholder="smtp.example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
            {errors.host && (
              <p className="text-red-500 text-sm mt-1">{errors.host.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Port *
            </label>
            <input
              type="number"
              {...register('port', { required: 'Port is required' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Security
            </label>
            <select
              {...register('secure')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value={true}>TLS/SSL</option>
              <option value={false}>None</option>
            </select>
          </div>
        </div>
      </div>

      {/* Authentication */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Lock size={18} />
          Authentication
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Username/Email *
          </label>
          <input
            {...register('username', { required: 'Username is required' })}
            placeholder="user@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            {...register('password', { required: 'Password is required' })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>
      </div>

      {/* Sender Info */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Mail size={18} />
          Sender Information
        </h3>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Name *
          </label>
          <input
            {...register('fromName', { required: 'From name is required' })}
            placeholder="Your Company"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            From Email *
          </label>
          <input
            type="email"
            {...register('fromEmail', { required: 'From email is required' })}
            placeholder="noreply@example.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Rate Limits */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Rate Limits</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Daily Limit
            </label>
            <input
              type="number"
              {...register('dailyLimit')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Limit
            </label>
            <input
              type="number"
              {...register('hourlyLimit')}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`
          p-4 rounded-lg flex items-start gap-3
          ${testResult.success 
            ? 'bg-green-50 border border-green-200' 
            : 'bg-red-50 border border-red-200'
          }
        `}>
          {testResult.success ? (
            <CheckCircle className="text-green-600 mt-0.5" size={20} />
          ) : (
            <X className="text-red-600 mt-0.5" size={20} />
          )}
          <div>
            <p className={`font-medium ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {testResult.success ? 'Success!' : 'Failed'}
            </p>
            <p className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handleSubmit(testConnection)}
          loading={testing}
          className="flex-1"
        >
          Test Connection
        </Button>
        <Button type="submit" className="flex-1">
          Save Configuration
        </Button>
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
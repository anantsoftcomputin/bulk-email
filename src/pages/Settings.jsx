import React, { useState, useEffect } from 'react';
import { Save, Trash2, Download, Database, User, Building, Bell, Settings as SettingsIcon, Mail } from 'lucide-react';
import { Button } from '../components/common/Button';
import Input from '../components/common/Input';
import { dbHelpers } from '../db/database';
import toast from 'react-hot-toast';
import { clearDemoData, exportAllData, getDatabaseStats } from '../utils/databaseHelpers';

const Settings = () => {
  const [settings, setSettings] = useState({
    userName: '',
    userEmail: '',
    companyName: '',
    companyWebsite: '',
    emailNotifications: true,
    campaignNotifications: true,
    maxEmailsPerHour: 100,
    emailRetryAttempts: 3,
    emailRetryDelay: 5,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dbStats, setDbStats] = useState(null);

  useEffect(() => {
    loadSettings();
    loadDbStats();
  }, []);

  const loadDbStats = async () => {
    try {
      const stats = await getDatabaseStats();
      setDbStats(stats);
    } catch (error) {
      console.error('Error loading database stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const allSettings = await dbHelpers.getAllSettings();
      setSettings({
        userName: allSettings.userName || '',
        userEmail: allSettings.userEmail || '',
        companyName: allSettings.companyName || '',
        companyWebsite: allSettings.companyWebsite || '',
        emailNotifications: allSettings.emailNotifications !== false,
        campaignNotifications: allSettings.campaignNotifications !== false,
        maxEmailsPerHour: allSettings.maxEmailsPerHour || 100,
        emailRetryAttempts: allSettings.emailRetryAttempts || 3,
        emailRetryDelay: allSettings.emailRetryDelay || 5,
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save each setting
      await Promise.all([
        dbHelpers.setSetting('userName', settings.userName),
        dbHelpers.setSetting('userEmail', settings.userEmail),
        dbHelpers.setSetting('companyName', settings.companyName),
        dbHelpers.setSetting('companyWebsite', settings.companyWebsite),
        dbHelpers.setSetting('emailNotifications', settings.emailNotifications),
        dbHelpers.setSetting('campaignNotifications', settings.campaignNotifications),
        dbHelpers.setSetting('maxEmailsPerHour', settings.maxEmailsPerHour),
        dbHelpers.setSetting('emailRetryAttempts', settings.emailRetryAttempts),
        dbHelpers.setSetting('emailRetryDelay', settings.emailRetryDelay),
      ]);
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-gray-600 mt-2 font-medium">Manage your account and application preferences</p>
        </div>
        <Button
          icon={<Save size={20} />}
          onClick={handleSave}
          disabled={saving}
          className="btn-gradient shadow-lg"
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      {/* Account Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Account Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Name"
            value={settings.userName}
            onChange={(e) => handleChange('userName', e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email"
            type="email"
            value={settings.userEmail}
            onChange={(e) => handleChange('userEmail', e.target.value)}
            placeholder="your@email.com"
          />
        </div>
      </div>

      {/* Company Information */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
            <Building className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Company Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Company Name"
            value={settings.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            placeholder="Your Company Name"
          />
          <Input
            label="Company Website"
            value={settings.companyWebsite}
            onChange={(e) => handleChange('companyWebsite', e.target.value)}
            placeholder="https://yourcompany.com"
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notification Settings</h2>
        </div>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-bold text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600 mt-1">Receive email notifications for important events</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <h3 className="font-bold text-gray-900">Campaign Notifications</h3>
              <p className="text-sm text-gray-600 mt-1">Get notified when campaigns complete</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.campaignNotifications}
                onChange={(e) => handleChange('campaignNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Email Queue Settings */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Email Queue Settings</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            label="Max Emails Per Hour"
            type="number"
            value={settings.maxEmailsPerHour}
            onChange={(e) => handleChange('maxEmailsPerHour', parseInt(e.target.value))}
            min="1"
            max="1000"
            help="Limit email sending rate to avoid SMTP restrictions"
          />
          <Input
            label="Retry Attempts"
            type="number"
            value={settings.emailRetryAttempts}
            onChange={(e) => handleChange('emailRetryAttempts', parseInt(e.target.value))}
            min="0"
            max="10"
            help="Number of times to retry failed emails"
          />
          <Input
            label="Retry Delay (minutes)"
            type="number"
            value={settings.emailRetryDelay}
            onChange={(e) => handleChange('emailRetryDelay', parseInt(e.target.value))}
            min="1"
            max="60"
            help="Wait time before retrying failed emails"
          />
        </div>
      </div>

      {/* Database Management */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Database className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Database Management</h2>
        </div>
        
        {/* Database Statistics */}
        {dbStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
              <div className="text-3xl font-bold text-blue-600 mb-1">{dbStats.contacts}</div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Contacts</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
              <div className="text-3xl font-bold text-emerald-600 mb-1">{dbStats.groups}</div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Groups</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-100">
              <div className="text-3xl font-bold text-purple-600 mb-1">{dbStats.templates}</div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Templates</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-100">
              <div className="text-3xl font-bold text-amber-600 mb-1">{dbStats.campaigns}</div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wide">Campaigns</div>
            </div>
          </div>
        )}

        {/* Data Management Actions */}
        <div className="space-y-6">
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Data Export/Import
            </h3>
            <Button
              variant="outline"
              onClick={async () => {
                try {
                  await exportAllData();
                  toast.success('Data exported successfully');
                } catch (error) {
                  toast.error('Failed to export data');
                }
              }}
              icon={<Download size={18} />}
            >
              Export All Data
            </Button>
            <p className="text-sm text-gray-600 mt-3">
              Export all your data as a JSON backup file
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Clear Demo Data
            </h3>
            <Button
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-50"
              onClick={async () => {
                if (window.confirm('Are you sure you want to clear all demo/sample data? This action cannot be undone!')) {
                  try {
                    await clearDemoData();
                    toast.success('Demo data cleared successfully');
                    // Reload stats and settings
                    await loadDbStats();
                    window.location.reload();
                  } catch (error) {
                    toast.error('Failed to clear demo data');
                  }
                }
              }}
              icon={<Trash2 size={18} />}
            >
              Clear All Demo Data
            </Button>
            <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700 font-medium">
                ⚠️ Warning: This will delete ALL contacts, groups, templates, campaigns, and reset the database. Settings will be preserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;

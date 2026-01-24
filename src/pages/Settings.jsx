import React, { useState, useEffect } from 'react';
import { Save, Trash2, Download, Database } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <Button
          icon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Card title="Account Settings">
        <div className="space-y-4">
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
      </Card>

      <Card title="Company Information">
        <div className="space-y-4">
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
      </Card>

      <Card title="Notification Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-600">Receive email notifications for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleChange('emailNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Campaign Notifications</h3>
              <p className="text-sm text-gray-600">Get notified when campaigns complete</p>
            </div>
            <input
              type="checkbox"
              checked={settings.campaignNotifications}
              onChange={(e) => handleChange('campaignNotifications', e.target.checked)}
              className="w-5 h-5 rounded border-gray-300"
            />
          </div>
        </div>
      </Card>

      <Card title="Email Queue Settings">
        <div className="space-y-4">
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
      </Card>

      <Card title="Database Management">
        <div className="space-y-6">
          {/* Database Statistics */}
          {dbStats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{dbStats.contacts}</div>
                <div className="text-sm text-gray-600">Contacts</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{dbStats.groups}</div>
                <div className="text-sm text-gray-600">Groups</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{dbStats.templates}</div>
                <div className="text-sm text-gray-600">Templates</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{dbStats.campaigns}</div>
                <div className="text-sm text-gray-600">Campaigns</div>
              </div>
            </div>
          )}

          {/* Data Management Actions */}
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Data Export/Import
              </h3>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={async () => {
                    try {
                      await exportAllData();
                    } catch (error) {
                      toast.error('Failed to export data');
                    }
                  }}
                  icon={<Download className="w-4 h-4" />}
                >
                  Export All Data
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Export all your data as a JSON backup file
              </p>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-medium mb-2 flex items-center gap-2 text-red-600">
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
              >
                Clear All Demo Data
              </Button>
              <p className="text-sm text-red-600 mt-2">
                ⚠️ Warning: This will delete ALL contacts, groups, templates, campaigns, and reset the database. Settings will be preserved.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Settings;

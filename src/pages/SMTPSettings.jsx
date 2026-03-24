import React, { useState, useEffect } from 'react';
import { Plus, Info, ChevronDown } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import SMTPTestModal from '../components/smtp/SMTPTestModal';
import SMTPList from '../components/smtp/SMTPList';
import SMTPStats from '../components/smtp/SMTPStats';
import { useSMTPStore } from '../store/smtpStore';
import { SMTP_PROVIDERS } from '../utils/constants';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '',
  provider: 'custom',
  host: '',
  port: 587,
  username: '',
  password: '',
  fromEmail: '',
  fromName: '',
  secure: false,
  isDefault: false,
};

// Group providers by category for the select dropdown
const PROVIDER_CATEGORIES = [...new Set(SMTP_PROVIDERS.map(p => p.category))];

const SMTPSettings = () => {
  const { smtpConfigs, initializeSMTPConfigs, addSMTPConfig, updateSMTPConfig, deleteSMTPConfig } = useSMTPStore();
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  useEffect(() => {
    initializeSMTPConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      setFormData(selectedConfig);
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [selectedConfig]);

  // When provider selection changes, auto-fill server settings
  const handleProviderChange = (providerId) => {
    const preset = SMTP_PROVIDERS.find(p => p.id === providerId);
    if (!preset) return;
    setFormData(prev => ({
      ...prev,
      provider: providerId,
      host: preset.host,
      port: preset.port,
      secure: preset.secure,
      // Auto-fill fixed usernames (e.g., "apikey" for SendGrid)
      username: preset.usernameFixed || prev.username,
    }));
  };

  // For Amazon SES: switch to the selected regional endpoint
  const handleSESRegionChange = (host) => {
    setFormData(prev => ({ ...prev, host }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.host || !formData.fromEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (selectedConfig) {
        await updateSMTPConfig(selectedConfig.id, formData);
        toast.success('SMTP configuration updated');
      } else {
        await addSMTPConfig(formData);
        toast.success('SMTP configuration added');
      }
      setShowModal(false);
      setSelectedConfig(null);
    } catch (error) {
      toast.error('Failed to save SMTP configuration');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this SMTP configuration?')) {
      await deleteSMTPConfig(id);
      toast.success('SMTP configuration deleted');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">SMTP Settings</h1>
          <p className="page-subtitle">Manage your outgoing mail server configurations</p>
        </div>
        <button
          onClick={() => { setSelectedConfig(null); setShowModal(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Config
        </button>
      </div>

      {smtpConfigs.length === 0 ? (
        <div className="card text-center py-16">
          <div className="icon-box-lg bg-indigo-50 mx-auto mb-4">
            <Plus className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">No SMTP Configurations</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first SMTP server to start sending emails</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Configuration
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <SMTPStats stats={{
            sent: smtpConfigs.reduce((s, c) => s + (c.stats?.sent || 0), 0),
            failed: smtpConfigs.reduce((s, c) => s + (c.stats?.failed || 0), 0),
            bounced: smtpConfigs.reduce((s, c) => s + (c.stats?.bounced || 0), 0),
            avgDeliveryTime: null,
          }} />
          <SMTPList
            configs={smtpConfigs}
            onEdit={(config) => { setSelectedConfig(config); setShowModal(true); }}
            onDelete={handleDelete}
            onTest={(config) => { setTestConfig(config); setShowTestModal(true); }}
          />
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedConfig(null);
        }}
        title={selectedConfig ? 'Edit SMTP Configuration' : 'Add SMTP Configuration'}
        size="lg"
      >
        {(() => {
          const activePreset = SMTP_PROVIDERS.find(p => p.id === formData.provider) || SMTP_PROVIDERS.find(p => p.id === 'custom');
          return (
            <div className="space-y-4">
              {/* Provider Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Provider
                </label>
                <div className="relative">
                  <select
                    value={formData.provider}
                    onChange={(e) => handleProviderChange(e.target.value)}
                    className="w-full px-4 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 appearance-none bg-white text-sm"
                  >
                    {PROVIDER_CATEGORIES.map(cat => (
                      <optgroup key={cat} label={cat}>
                        {SMTP_PROVIDERS.filter(p => p.category === cat).map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Provider Help Text */}
              {activePreset?.helpText && activePreset.id !== 'custom' && (
                <div className="flex gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5 text-sm text-blue-800">
                  <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-500" />
                  <span>{activePreset.helpText}</span>
                </div>
              )}

              {/* Amazon SES Region Selector */}
              {formData.provider === 'amazon_ses' && activePreset?.regions && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">AWS Region</label>
                  <div className="relative">
                    <select
                      value={formData.host}
                      onChange={(e) => handleSESRegionChange(e.target.value)}
                      className="w-full px-4 py-2 pr-9 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 appearance-none bg-white text-sm"
                    >
                      {activePreset.regions.map(r => (
                        <option key={r.host} value={r.host}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>
              )}

              {/* Config Name */}
              <Input
                label="Configuration Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={activePreset?.id !== 'custom' ? `e.g., ${activePreset?.name} — Production` : 'e.g., My SMTP Server'}
                required
              />

              {/* Host & Port — hidden for SES (controlled by region selector) */}
              {formData.provider !== 'amazon_ses' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="SMTP Host"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      placeholder="smtp.example.com"
                      required
                    />
                  </div>
                  <Input
                    label="Port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}
              {formData.provider === 'amazon_ses' && (
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <Input
                      label="SMTP Host (auto-set by region)"
                      value={formData.host}
                      onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                      required
                    />
                  </div>
                  <Input
                    label="Port"
                    type="number"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                    required
                  />
                </div>
              )}

              {/* Username */}
              <Input
                label={activePreset?.usernameLabel || 'Username'}
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={activePreset?.usernameFixed || activePreset?.usernamePlaceholder || 'username'}
                disabled={!!activePreset?.usernameFixed}
                required
              />

              {/* Password */}
              <Input
                label={activePreset?.passwordLabel || 'Password'}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                required
              />

              {/* From Email & From Name */}
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="From Email"
                  type="email"
                  value={formData.fromEmail}
                  onChange={(e) => setFormData({ ...formData, fromEmail: e.target.value })}
                  placeholder="noreply@example.com"
                  required
                />
                <Input
                  label="From Name"
                  value={formData.fromName}
                  onChange={(e) => setFormData({ ...formData, fromName: e.target.value })}
                  placeholder="Your Company"
                />
              </div>

              {/* Security & Default Toggles */}
              <div className="flex flex-col gap-2 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.secure}
                    onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Use secure connection (TLS/SSL)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">Set as default SMTP configuration</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedConfig(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {selectedConfig ? 'Update' : 'Add'} Configuration
                </Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <SMTPTestModal
        isOpen={showTestModal}
        onClose={() => {
          setShowTestModal(false);
          setTestConfig(null);
        }}
        smtpConfig={testConfig}
      />
    </div>
  );
};

export default SMTPSettings;

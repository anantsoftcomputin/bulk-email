import React, { useState, useEffect } from 'react';
import { Plus, Server, Mail, Pencil, Trash2, Zap, CheckCircle } from 'lucide-react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import SMTPTestModal from '../components/smtp/SMTPTestModal';
import { useSMTPStore } from '../store/smtpStore';
import toast from 'react-hot-toast';

const SMTPSettings = () => {
  const { smtpConfigs, initializeSMTPConfigs, addSMTPConfig, updateSMTPConfig, deleteSMTPConfig } = useSMTPStore();
  const [showModal, setShowModal] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testConfig, setTestConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    provider: 'custom',
    host: '',
    port: 587,
    username: '',
    password: '',
    fromEmail: '',
    fromName: '',
    secure: true,
    isDefault: false,
  });

  useEffect(() => {
    initializeSMTPConfigs();
  }, []);

  useEffect(() => {
    if (selectedConfig) {
      setFormData(selectedConfig);
    } else {
      setFormData({
        name: '',
        provider: 'custom',
        host: '',
        port: 587,
        username: '',
        password: '',
        fromEmail: '',
        fromName: '',
        secure: true,
        isDefault: false,
      });
    }
  }, [selectedConfig]);

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
            <Server className="w-7 h-7 text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-gray-800 mb-1">No SMTP Configurations</h3>
          <p className="text-sm text-gray-500 mb-6">Add your first SMTP server to start sending emails</p>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" /> Add Configuration
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {smtpConfigs.map((config) => (
            <div key={config.id} className="card hover:shadow-card-hover transition-shadow duration-200">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-indigo-50">
                    <Mail className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{config.name}</h3>
                    <p className="text-xs text-gray-400">{config.host}:{config.port}</p>
                  </div>
                </div>
                {config.isDefault && (
                  <span className="badge badge-sent">
                    <CheckCircle className="w-3 h-3" /> Default
                  </span>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-gray-500 border-t border-surface-100 pt-4 mb-4">
                <div className="flex justify-between">
                  <span>From</span>
                  <span className="font-medium text-gray-700">{config.fromEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span>Username</span>
                  <span className="font-medium text-gray-700">{config.username}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-surface-200 text-gray-600 hover:bg-surface-50 transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => { setTestConfig(config); setShowTestModal(true); }}
                >
                  <Zap className="w-3.5 h-3.5" /> Test
                </button>
                <button
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-surface-200 text-gray-600 hover:bg-surface-50 transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => { setSelectedConfig(config); setShowModal(true); }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button
                  className="flex-1 text-xs font-medium py-2 px-3 rounded-lg border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                  onClick={() => handleDelete(config.id)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
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
        <div className="space-y-4">
          <Input
            label="Configuration Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Gmail SMTP"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="SMTP Host"
              value={formData.host}
              onChange={(e) => setFormData({ ...formData, host: e.target.value })}
              placeholder="smtp.gmail.com"
              required
            />
            <Input
              label="Port"
              type="number"
              value={formData.port}
              onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            placeholder="your-email@gmail.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="••••••••"
            required
          />

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

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="secure"
              checked={formData.secure}
              onChange={(e) => setFormData({ ...formData, secure: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="secure" className="text-sm text-gray-700">
              Use secure connection (TLS/SSL)
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="rounded border-gray-300"
            />
            <label htmlFor="isDefault" className="text-sm text-gray-700">
              Set as default SMTP configuration
            </label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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

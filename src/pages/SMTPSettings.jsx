import React, { useState, useEffect } from 'react';
import { Plus, Server } from 'lucide-react';
import Card from '../components/common/Card';
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">SMTP Settings</h1>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => {
            setSelectedConfig(null);
            setShowModal(true);
          }}
        >
          Add Configuration
        </Button>
      </div>

      {smtpConfigs.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Server className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No SMTP Configurations
            </h3>
            <p className="text-gray-600 mb-6">
              Add your first SMTP configuration to start sending emails
            </p>
            <Button onClick={() => setShowModal(true)}>
              Add Configuration
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {smtpConfigs.map((config) => (
            <Card key={config.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">{config.name}</h3>
                    <p className="text-sm text-gray-600">{config.host}:{config.port}</p>
                  </div>
                  {config.isDefault && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </div>
                
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">From:</span>
                    <span className="font-medium">{config.fromEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Username:</span>
                    <span className="font-medium">{config.username}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-4 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTestConfig(config);
                      setShowTestModal(true);
                    }}
                  >
                    Test
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedConfig(config);
                      setShowModal(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(config.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
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

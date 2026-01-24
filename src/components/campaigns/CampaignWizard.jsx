import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, Mail, Users, FileText, Eye } from 'lucide-react';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useCampaignStore } from '../../store/campaignStore.db';
import { useContactStore } from '../../store/contactStore.db';
import { useGroupStore } from '../../store/groupStore';
import { useTemplateStore } from '../../store/templateStore.db';
import { dbHelpers } from '../../db/database';
import toast from 'react-hot-toast';

const STEPS = [
  { id: 1, name: 'Basic Info', icon: Mail },
  { id: 2, name: 'Select Template', icon: FileText },
  { id: 3, name: 'Choose Recipients', icon: Users },
  { id: 4, name: 'Review', icon: Eye },
];

const CampaignWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    subject: '',
    previewText: '',
    templateId: null,
    recipientType: 'contacts',
    selectedContacts: [],
    selectedGroups: [],
    scheduleType: 'immediate',
    scheduledDate: '',
    scheduledTime: '',
  });

  const { addCampaign, initializeCampaigns, updateCampaign } = useCampaignStore();
  const { contacts, initializeContacts } = useContactStore();
  const { groups, initializeGroups } = useGroupStore();
  const { templates, initializeTemplates } = useTemplateStore();

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [recipientCount, setRecipientCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      initializeContacts();
      initializeGroups();
      initializeTemplates();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.templateId) {
      const template = templates.find(t => t.id === formData.templateId);
      setSelectedTemplate(template);
    }
  }, [formData.templateId, templates]);

  useEffect(() => {
    calculateRecipientCount();
  }, [formData.selectedContacts, formData.selectedGroups, formData.recipientType]);

  const calculateRecipientCount = async () => {
    if (formData.recipientType === 'contacts') {
      setRecipientCount(formData.selectedContacts.length);
    } else {
      let count = 0;
      for (const groupId of formData.selectedGroups) {
        const groupContacts = await dbHelpers.getGroupContacts(groupId);
        count += groupContacts.length;
      }
      setRecipientCount(count);
    }
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const validateStep = () => {
    switch (currentStep) {
      case 1:
        if (!formData.name || !formData.subject) {
          toast.error('Please fill in campaign name and subject');
          return false;
        }
        return true;
      case 2:
        if (!formData.templateId) {
          toast.error('Please select a template');
          return false;
        }
        return true;
      case 3:
        if (formData.recipientType === 'contacts' && formData.selectedContacts.length === 0) {
          toast.error('Please select at least one contact');
          return false;
        }
        if (formData.recipientType === 'groups' && formData.selectedGroups.length === 0) {
          toast.error('Please select at least one group');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    try {
      let scheduledFor = null;
      let campaignStatus = 'draft';

      if (formData.scheduleType === 'scheduled') {
        if (!formData.scheduledDate || !formData.scheduledTime) {
          toast.error('Please select date and time for scheduled campaign');
          return;
        }
        scheduledFor = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toISOString();
        campaignStatus = 'scheduled';
      }

      console.log('Creating campaign with data:', {
        name: formData.name,
        subject: formData.subject,
        templateId: formData.templateId,
        recipientType: formData.recipientType,
        selectedContacts: formData.selectedContacts,
        selectedGroups: formData.selectedGroups,
      });

      const result = await addCampaign({
        name: formData.name,
        subject: formData.subject,
        previewText: formData.previewText,
        templateId: formData.templateId,
        status: campaignStatus,
        scheduledFor,
        totalRecipients: recipientCount,
        stats: {
          total: recipientCount,
          sent: 0,
          delivered: 0,
          opened: 0,
          clicked: 0,
          bounced: 0,
          failed: 0,
        },
      });

      // Handle both cases: if result is an object with id, or just the id
      const campaignId = typeof result === 'object' ? result.id : result;
      console.log('Campaign created with ID:', campaignId);

      let recipients = [];
      if (formData.recipientType === 'contacts') {
        recipients = formData.selectedContacts.map(contactId => {
          const contact = contacts.find(c => c.id === contactId);
          return {
            campaignId,
            contactId,
            email: contact.email,
            status: 'pending',
            createdAt: new Date().toISOString(),
          };
        });
      } else {
        for (const groupId of formData.selectedGroups) {
          const groupContacts = await dbHelpers.getGroupContacts(groupId);
          const groupRecipients = groupContacts.map(contact => ({
            campaignId,
            contactId: contact.id,
            email: contact.email,
            status: 'pending',
            createdAt: new Date().toISOString(),
          }));
          recipients = [...recipients, ...groupRecipients];
        }
      }

      console.log('Recipients to add:', recipients);

      for (const recipient of recipients) {
        const recipientId = await dbHelpers.addCampaignRecipient(recipient);
        console.log('Added recipient with ID:', recipientId);
      }

      await updateCampaign(campaignId, { totalRecipients: recipients.length });
      await initializeCampaigns();
      
      if (formData.scheduleType === 'scheduled') {
        toast.success(`Campaign scheduled for ${new Date(scheduledFor).toLocaleString()}`);
      } else {
        toast.success('Campaign created successfully!');
      }
      
      onClose();
      resetForm();
    } catch (error) {
      console.error('Error creating campaign:', error);
      toast.error(`Failed to create campaign: ${error.message}`);
    }
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData({
      name: '',
      subject: '',
      previewText: '',
      templateId: null,
      recipientType: 'contacts',
      selectedContacts: [],
      selectedGroups: [],
      scheduleType: 'immediate',
      scheduledDate: '',
      scheduledTime: '',
    });
    setSelectedTemplate(null);
  };

  const toggleContactSelection = (contactId) => {
    if (formData.selectedContacts.includes(contactId)) {
      setFormData({
        ...formData,
        selectedContacts: formData.selectedContacts.filter(id => id !== contactId),
      });
    } else {
      setFormData({
        ...formData,
        selectedContacts: [...formData.selectedContacts, contactId],
      });
    }
  };

  const toggleGroupSelection = (groupId) => {
    if (formData.selectedGroups.includes(groupId)) {
      setFormData({
        ...formData,
        selectedGroups: formData.selectedGroups.filter(id => id !== groupId),
      });
    } else {
      setFormData({
        ...formData,
        selectedGroups: [...formData.selectedGroups, groupId],
      });
    }
  };

  const selectAllContacts = () => {
    setFormData({
      ...formData,
      selectedContacts: contacts.map(c => c.id),
    });
  };

  const selectAllGroups = () => {
    setFormData({
      ...formData,
      selectedGroups: groups.map(g => g.id),
    });
  };

  const filteredContacts = contacts.filter(contact => {
    const query = searchQuery.toLowerCase();
    return (
      contact.firstName?.toLowerCase().includes(query) ||
      contact.lastName?.toLowerCase().includes(query) ||
      contact.email?.toLowerCase().includes(query) ||
      contact.company?.toLowerCase().includes(query)
    );
  });

  const filteredGroups = groups.filter(group => {
    const query = searchQuery.toLowerCase();
    return group.name?.toLowerCase().includes(query);
  });

  const getPreviewContent = () => {
    if (!selectedTemplate || !selectedTemplate.htmlContent) return '';
    
    return selectedTemplate.htmlContent
      .replace(/{{firstName}}/g, 'John')
      .replace(/{{lastName}}/g, 'Doe')
      .replace(/{{email}}/g, 'john@example.com')
      .replace(/{{company}}/g, 'Example Corp')
      .replace(/{{phone}}/g, '+1-234-567-8900');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        onClose();
        resetForm();
      }}
      title="Create Campaign"
      size="fullscreen"
    >
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep > step.id
                        ? 'bg-green-500 text-white'
                        : currentStep === step.id
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check size={24} />
                    ) : (
                      <step.icon size={24} />
                    )}
                  </div>
                  <p
                    className={`mt-2 text-sm font-medium ${
                      currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {step.name}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-4 ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Q1 Newsletter Campaign"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject Line *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Your compelling subject line"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview Text (Optional)
                </label>
                <input
                  type="text"
                  value={formData.previewText}
                  onChange={(e) => setFormData({ ...formData, previewText: e.target.value })}
                  placeholder="Text shown in inbox preview"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  This appears below the subject line in most email clients
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Select Template */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Choose Your Email Template</h3>
                <p className="text-gray-600 mt-1">Select a template for this campaign</p>
              </div>

              {templates.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="mx-auto text-gray-400 mb-4" size={48} />
                  <p className="text-gray-600">No templates found. Create one first!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => setFormData({ ...formData, templateId: template.id })}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        formData.templateId === template.id
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{template.name}</h4>
                        {formData.templateId === template.id && (
                          <Check className="text-purple-600" size={20} />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{template.subject}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 3: Choose Recipients */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Choose Recipients</h3>
                    <p className="text-gray-600 mt-1">Select contacts or groups to send this campaign to</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-600">{recipientCount}</div>
                    <div className="text-sm text-gray-600">Total Recipients</div>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setFormData({ ...formData, recipientType: 'contacts' });
                      setSearchQuery('');
                    }}
                    className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                      formData.recipientType === 'contacts'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Users size={20} />
                    <span>Individual Contacts</span>
                  </button>
                  <button
                    onClick={() => {
                      setFormData({ ...formData, recipientType: 'groups' });
                      setSearchQuery('');
                    }}
                    className={`flex-1 px-6 py-4 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 ${
                      formData.recipientType === 'groups'
                        ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                    }`}
                  >
                    <Users size={20} />
                    <span>Contact Groups</span>
                  </button>
                </div>
              </div>

              {formData.recipientType === 'contacts' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search contacts by name, email, or company..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Mail className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 font-medium">
                        {formData.selectedContacts.length} of {filteredContacts.length} selected
                      </span>
                      <Button size="sm" variant="outline" onClick={selectAllContacts}>
                        Select All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setFormData({ ...formData, selectedContacts: [] })}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {contacts.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50">
                        <Users className="mx-auto text-gray-400 mb-4" size={56} />
                        <p className="text-gray-600 font-medium">No contacts found</p>
                        <p className="text-sm text-gray-500 mt-1">Add contacts first to send campaigns</p>
                      </div>
                    ) : filteredContacts.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50">
                        <Mail className="mx-auto text-gray-400 mb-4" size={56} />
                        <p className="text-gray-600 font-medium">No contacts match your search</p>
                        <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <table className="w-full">
                          <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                              <th className="w-12 px-4 py-3"></th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Name</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Email</th>
                              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase">Company</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {filteredContacts.map((contact) => (
                              <tr
                                key={contact.id}
                                onClick={() => toggleContactSelection(contact.id)}
                                className={`cursor-pointer transition-colors ${
                                  formData.selectedContacts.includes(contact.id)
                                    ? 'bg-purple-50 hover:bg-purple-100'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <td className="px-4 py-3">
                                  <input
                                    type="checkbox"
                                    checked={formData.selectedContacts.includes(contact.id)}
                                    onChange={() => {}}
                                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <p className="font-medium text-gray-900">
                                    {contact.firstName} {contact.lastName}
                                  </p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-gray-700">{contact.email}</p>
                                </td>
                                <td className="px-4 py-3">
                                  <p className="text-gray-600">{contact.company || '-'}</p>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.recipientType === 'groups' && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1 mr-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search groups by name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                        <Users className="absolute left-3 top-3.5 text-gray-400" size={18} />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600 font-medium">
                        {formData.selectedGroups.length} of {filteredGroups.length} selected
                      </span>
                      <Button size="sm" variant="outline" onClick={selectAllGroups}>
                        Select All
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setFormData({ ...formData, selectedGroups: [] })}
                      >
                        Clear
                      </Button>
                    </div>
                  </div>

                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    {groups.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50">
                        <Users className="mx-auto text-gray-400 mb-4" size={56} />
                        <p className="text-gray-600 font-medium">No groups found</p>
                        <p className="text-sm text-gray-500 mt-1">Create groups first to send campaigns</p>
                      </div>
                    ) : filteredGroups.length === 0 ? (
                      <div className="text-center py-16 bg-gray-50">
                        <Users className="mx-auto text-gray-400 mb-4" size={56} />
                        <p className="text-gray-600 font-medium">No groups match your search</p>
                        <p className="text-sm text-gray-500 mt-1">Try different keywords</p>
                      </div>
                    ) : (
                      <div className="max-h-96 overflow-y-auto">
                        <div className="divide-y divide-gray-200">
                          {filteredGroups.map((group) => (
                            <label
                              key={group.id}
                              className={`flex items-center p-5 cursor-pointer transition-colors ${
                                formData.selectedGroups.includes(group.id)
                                  ? 'bg-purple-50 hover:bg-purple-100'
                                  : 'hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={formData.selectedGroups.includes(group.id)}
                                onChange={() => toggleGroupSelection(group.id)}
                                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 w-4 h-4"
                              />
                              <div className="ml-4 flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold text-gray-900 text-lg">{group.name}</p>
                                  <div className="flex items-center space-x-2">
                                    <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                      {group.contactCount || 0} contacts
                                    </div>
                                  </div>
                                </div>
                                {group.description && (
                                  <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                                )}
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Summary</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Campaign Name</p>
                      <p className="font-semibold text-gray-900">{formData.name}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Subject Line</p>
                      <p className="font-semibold text-gray-900">{formData.subject}</p>
                    </div>
                    
                    {formData.previewText && (
                      <div>
                        <p className="text-sm text-gray-600">Preview Text</p>
                        <p className="text-gray-900">{formData.previewText}</p>
                      </div>
                    )}
                    
                    <div>
                      <p className="text-sm text-gray-600">Template</p>
                      <p className="font-semibold text-gray-900">{selectedTemplate?.name || 'N/A'}</p>
                    </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Campaign</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="immediate"
                          checked={formData.scheduleType === 'immediate'}
                          onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium text-gray-900">Send Immediately</span>
                      </label>
                      
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="scheduleType"
                          value="scheduled"
                          checked={formData.scheduleType === 'scheduled'}
                          onChange={(e) => setFormData({ ...formData, scheduleType: e.target.value })}
                          className="mr-2 text-purple-600 focus:ring-purple-500"
                        />
                        <span className="font-medium text-gray-900">Schedule for Later</span>
                      </label>
                    </div>

                    {formData.scheduleType === 'scheduled' && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={formData.scheduledDate}
                            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Time *
                          </label>
                          <input
                            type="time"
                            value={formData.scheduledTime}
                            onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                        </div>

                        {formData.scheduledDate && formData.scheduledTime && (
                          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                            <p className="text-sm text-purple-900">
                              📅 Campaign will be sent on{' '}
                              <span className="font-semibold">
                                {new Date(`${formData.scheduledDate}T${formData.scheduledTime}`).toLocaleString()}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                    
                    <div>
                      <p className="text-sm text-gray-600">Recipients</p>
                      <p className="font-semibold text-gray-900">
                        {recipientCount} contact{recipientCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Email Preview</h3>
                
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="font-semibold text-gray-900">{formData.subject || 'No subject'}</p>
                    {formData.previewText && (
                      <p className="text-sm text-gray-600 mt-1">{formData.previewText}</p>
                    )}
                  </div>

                  <div className="bg-white p-4 max-h-96 overflow-y-auto">
                    {selectedTemplate ? (
                      <div dangerouslySetInnerHTML={{ __html: getPreviewContent() }} />
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <Mail className="mx-auto mb-4" size={48} />
                        <p>No template selected</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200 mt-6">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={handlePrevious} icon={<ArrowLeft size={18} />}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" onClick={() => { onClose(); resetForm(); }}>
              Cancel
            </Button>
            
            {currentStep < 4 ? (
              <Button onClick={handleNext} icon={<ArrowRight size={18} />}>
                Next
              </Button>
            ) : (
              <Button onClick={handleSubmit} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Create Campaign
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CampaignWizard;

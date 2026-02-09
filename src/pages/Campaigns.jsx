import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Copy, Trash2, Send, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '../components/common/Button';
import CampaignWizard from '../components/campaigns/CampaignWizard';
import { useCampaignStore } from '../store/campaignStore.db';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import emailQueueService from '../services/emailQueue';
import { db } from '../db/database';

const Campaigns = () => {
  const navigate = useNavigate();
  const [showWizard, setShowWizard] = useState(false);
  const { campaigns, initializeCampaigns, deleteCampaign, updateCampaign, syncAllCampaignStats } = useCampaignStore();

  useEffect(() => {
    const loadData = async () => {
      await initializeCampaigns();
      // Sync campaign stats from tracking events
      if (syncAllCampaignStats) {
        await syncAllCampaignStats();
      }
    };
    loadData();
  }, []);

  const updateCampaignStatus = async (campaignId, status) => {
    try {
      console.log('Updating campaign status:', campaignId, status);
      await updateCampaign(campaignId, { status });
      
      // Refresh campaigns list immediately
      await initializeCampaigns();
      
      // If starting to send, add to email queue
      if (status === 'sending') {
        const campaign = campaigns.find(c => c.id === campaignId);
        console.log('Found campaign:', campaign);
        
        if (campaign) {
          // Get campaign recipients
          const recipients = await db.campaignRecipients.where('campaignId').equals(campaignId).toArray();
          console.log('Campaign recipients:', recipients);
          
          if (recipients.length === 0) {
            toast.error('No recipients assigned to this campaign');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }

          // Get template
          const template = await db.templates.get(campaign.templateId);
          console.log('Template:', template);
          
          if (!template) {
            toast.error('Template not found for this campaign');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }

          // Get full contact details for each recipient
          const contacts = [];
          for (const recipient of recipients) {
            const contact = await db.contacts.get(recipient.contactId);
            if (contact) {
              contacts.push(contact);
            }
          }
          console.log('Contacts to send to:', contacts);

          if (contacts.length === 0) {
            toast.error('No valid contacts found for this campaign');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }

          // Add to email queue
          const queuedCount = await emailQueueService.addCampaignToQueue(
            campaignId, 
            contacts, 
            {
              subject: campaign.subject,
              body: template.htmlContent || template.body || ''
            }
          );
          
          console.log(`Added ${queuedCount} emails to queue`);
          
          // Update campaign stats with sent count
          const updatedStats = {
            ...campaign.stats,
            sent: (campaign.stats?.sent || 0) + queuedCount,
            total: queuedCount,
          };
          await updateCampaign(campaignId, { 
            stats: updatedStats,
            sentAt: new Date().toISOString()
          });
          
          toast.success(`Campaign started! ${queuedCount} emails added to queue`);
          
          // Start processing if not already running
          if (!emailQueueService.isProcessing) {
            emailQueueService.startProcessing();
            console.log('Email queue processor started');
          }
          
          // Refresh campaigns to show updated stats
          await initializeCampaigns();
        }
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error(`Failed to update campaign status: ${error.message}`);
      await initializeCampaigns();
    }
  };

  const duplicateCampaign = async (campaignId) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        const newCampaign = {
          ...campaign,
          id: undefined, // Let database generate new ID
          name: `${campaign.name} (Copy)`,
          status: 'draft',
          createdAt: new Date().toISOString(),
        };
        
        await db.campaigns.add(newCampaign);
        await initializeCampaigns();
        toast.success('Campaign duplicated');
      }
    } catch (error) {
      console.error('Error duplicating campaign:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const columns = [
    {
      header: 'Campaign',
      render: (row) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-gray-500">{row.subject}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      render: (row) => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            row.status === 'sent'
              ? 'bg-green-100 text-green-800'
              : row.status === 'sending'
              ? 'bg-blue-100 text-blue-800'
              : row.status === 'scheduled'
              ? 'bg-purple-100 text-purple-800'
              : row.status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: 'Recipients',
      render: (row) => {
        const count = row.totalRecipients || 0;
        return (
          <div className="flex items-center space-x-2">
            <span className="font-medium">{count}</span>
            {count === 0 && (
              <span className="text-xs text-red-600">(No recipients)</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Sent / Opened',
      render: (row) => (
        <div className="text-sm">
          <div>{row.stats?.sent || 0} sent</div>
          <div className="text-gray-500">{row.stats?.opened || 0} opened</div>
        </div>
      ),
    },
    {
      header: 'Created',
      render: (row) => format(new Date(row.createdAt), 'MMM dd, yyyy'),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.status === 'draft' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => updateCampaignStatus(row.id, 'sending')}
              icon={<Play className="w-4 h-4" />}
            >
              Send
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              duplicateCampaign(row.id);
              toast.success('Campaign duplicated');
            }}
            icon={<Copy className="w-4 h-4" />}
          >
            Duplicate
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={async () => {
              if (confirm('Delete this campaign?')) {
                await deleteCampaign(row.id);
                toast.success('Campaign deleted');
              }
            }}
            icon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      sent: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
      sending: 'bg-blue-100 text-blue-700 border border-blue-200',
      scheduled: 'bg-purple-100 text-purple-700 border border-purple-200',
      failed: 'bg-red-100 text-red-700 border border-red-200',
      draft: 'bg-gray-100 text-gray-700 border border-gray-200'
    };
    return variants[status] || variants.draft;
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Campaigns</h1>
          <p className="text-gray-600 mt-2 font-medium">Create and manage email campaigns</p>
        </div>
        <Button
          icon={<Plus size={20} />}
          onClick={() => setShowWizard(true)}
          className="btn-gradient shadow-lg"
        >
          Create Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{campaigns.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Send className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Active</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <BarChart3 className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Drafts</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {campaigns.filter(c => c.status === 'draft').length}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Calendar className="text-white" size={28} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Total Recipients</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {campaigns.reduce((sum, c) => sum + (c.totalRecipients || 0), 0)}
              </p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="text-white" size={28} />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {campaigns.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No campaigns yet</h3>
          <p className="text-gray-600 mb-6">Create your first campaign to start sending emails</p>
          <Button
            onClick={() => setShowWizard(true)}
            icon={<Plus size={20} />}
            className="btn-gradient"
          >
            Create Your First Campaign
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Campaign</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Recipients</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Performance</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {campaigns.map((campaign, idx) => (
                  <tr 
                    key={campaign.id}
                    className={`hover:bg-blue-50 transition-all duration-200 ${
                      idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{campaign.subject}</div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusBadge(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center">
                        <span className="font-bold text-gray-900">{campaign.totalRecipients || 0}</span>
                        {(campaign.totalRecipients || 0) === 0 && (
                          <span className="ml-2 text-xs text-red-600 font-medium">(No recipients)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="text-gray-600">Sent:</span> <span className="font-bold text-gray-900">{campaign.stats?.sent || 0}</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-gray-600">Opened:</span> <span className="font-bold text-emerald-600">{campaign.stats?.opened || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm text-gray-600">{format(new Date(campaign.createdAt), 'MMM dd, yyyy')}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        {campaign.status === 'draft' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                            icon={<Play size={14} />}
                          >
                            Send
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => duplicateCampaign(campaign.id)}
                          icon={<Copy size={14} />}
                        >
                          
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={async () => {
                            if (window.confirm('Delete this campaign?')) {
                              await deleteCampaign(campaign.id);
                              toast.success('Campaign deleted');
                            }
                          }}
                          icon={<Trash2 size={14} />}
                        >
                          
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Campaign Wizard */}
      {showWizard && (
        <CampaignWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
        />
      )}
    </div>
  );
};

export default Campaigns;

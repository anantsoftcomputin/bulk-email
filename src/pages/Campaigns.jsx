import React, { useState, useEffect } from 'react';
import { Plus, Play, Pause, Copy, Trash2 } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Table from '../components/common/Table';
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
  const { campaigns, initializeCampaigns, deleteCampaign, updateCampaign } = useCampaignStore();

  useEffect(() => {
    initializeCampaigns();
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
          toast.success(`Campaign started! ${queuedCount} emails added to queue`);
          
          // Start processing if not already running
          if (!emailQueueService.isProcessing) {
            emailQueueService.startProcessing();
            console.log('Email queue processor started');
          }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
        <Button
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setShowWizard(true)}
        >
          Create Campaign
        </Button>
      </div>

      <Card>
        <Table
          columns={columns}
          data={campaigns}
          emptyMessage="No campaigns yet. Create your first campaign!"
        />

      {showWizard && (
        <CampaignWizard
          isOpen={showWizard}
          onClose={() => setShowWizard(false)}
        />
      )}
      </Card>
    </div>
  );
};

export default Campaigns;

import React, { useState, useEffect } from 'react';
import {
  Plus, Play, Copy, Trash2, Send, Users, BarChart3, Calendar,
  CheckCircle2, Clock, AlertCircle, Activity, ArrowUpRight, RefreshCw, Pencil,
} from 'lucide-react';
import CampaignWizard from '../components/campaigns/CampaignWizard';
import CampaignProgress from '../components/campaigns/CampaignProgress';
import { useCampaignStore } from '../store/campaignStore.db';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import emailQueueService from '../services/emailQueue';
import { db, dbHelpers } from '../db/database';
import { renderEmailHTML } from '../utils/emailHtmlRenderer';

const StatusBadge = ({ status }) => {
  const map = {
    sent:      'badge-sent',
    sending:   'badge-sending',
    draft:     'badge-draft',
    failed:    'badge-failed',
    scheduled: 'badge-scheduled',
  };
  const icons = {
    sent: <CheckCircle2 size={10} />,
    sending: <Activity size={10} />,
    scheduled: <Clock size={10} />,
    failed: <AlertCircle size={10} />,
  };
  return (
    <span className={`badge ${map[status] || 'badge-draft'} capitalize`}>
      {icons[status]}
      {status}
    </span>
  );
};

const Campaigns = () => {
  const [showWizard, setShowWizard] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [showProgress, setShowProgress] = useState(false);
  const [activeCampaignId, setActiveCampaignId] = useState(null);
  const { campaigns, initializeCampaigns, deleteCampaign, updateCampaign, syncAllCampaignStats } = useCampaignStore();

  useEffect(() => {
    const loadData = async () => {
      await initializeCampaigns();
      if (syncAllCampaignStats) await syncAllCampaignStats();
    };
    loadData();
    const interval = setInterval(async () => {
      if (syncAllCampaignStats) await syncAllCampaignStats();
      await initializeCampaigns();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateCampaignStatus = async (campaignId, status) => {
    try {
      await updateCampaign(campaignId, { status });
      await initializeCampaigns();
      if (status === 'sending') {
        const campaign = campaigns.find(c => c.id === campaignId);
        if (campaign) {
          const recipients = await db.campaignRecipients.where('campaignId').equals(campaignId).toArray();
          if (recipients.length === 0) {
            toast.error('No recipients assigned to this campaign');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }
          const template = await db.templates.get(campaign.templateId);
          if (!template) {
            toast.error('Template not found');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }
          const contacts = [];
          for (const recipient of recipients) {
            const contact = await db.contacts.get(recipient.contactId);
            if (contact) contacts.push(contact);
          }
          if (contacts.length === 0) {
            toast.error('No valid contacts found');
            await updateCampaign(campaignId, { status: 'draft' });
            await initializeCampaigns();
            return;
          }
          // Re-render the HTML from builder blocks so the email always matches
          // the visual design. Fall back to stored htmlContent for raw-HTML templates.
          let emailHtml;
          if (template.builderData?.blocks?.length > 0) {
            emailHtml = renderEmailHTML({
              settings: template.builderData.settings || {},
              blocks: template.builderData.blocks || [],
            });
          } else {
            emailHtml = template.htmlContent || template.body || '';
          }

          const queuedCount = await emailQueueService.addCampaignToQueue(
            campaignId, contacts,
            { subject: campaign.subject, body: emailHtml }
          );
          await updateCampaign(campaignId, {
            stats: { ...campaign.stats, sent: (campaign.stats?.sent || 0) + queuedCount, total: queuedCount },
            sentAt: new Date().toISOString(),
          });
          toast.success(`Campaign started! ${queuedCount} emails queued`);
          setActiveCampaignId(campaignId);
          setShowProgress(true);
          if (!emailQueueService.isProcessing) emailQueueService.startProcessing();
          await initializeCampaigns();
        }
      }
    } catch (error) {
      console.error('Error updating campaign status:', error);
      toast.error(`Failed to update campaign: ${error.message}`);
      await initializeCampaigns();
    }
  };

  const duplicateCampaign = async (campaignId) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (campaign) {
        // Destructure out id so Firestore never receives id:undefined
        const { id: _id, ...rest } = campaign;
        const newCampaignId = await db.campaigns.add({ ...rest, name: `${campaign.name} (Copy)`, status: 'draft', createdAt: new Date().toISOString() });
        // Copy all recipients from the original campaign to the new one
        const existingRecipients = await dbHelpers.getCampaignRecipients(campaignId);
        for (const { id: _rid, ...recip } of existingRecipients) {
          await dbHelpers.addCampaignRecipient({ ...recip, campaignId: newCampaignId, status: 'pending' });
        }
        await initializeCampaigns();
        toast.success(`Campaign duplicated with ${existingRecipients.length} recipient${existingRecipients.length !== 1 ? 's' : ''}`);
      }
    } catch (error) {
      console.error('Duplicate campaign error:', error);
      toast.error('Failed to duplicate campaign');
    }
  };

  const handleDelete = async (campaignId) => {
    if (!window.confirm('Delete this campaign? This action cannot be undone.')) return;
    await deleteCampaign(campaignId);
    toast.success('Campaign deleted');
  };

  const statCards = [
    { label: 'Total',     value: campaigns.length,                                                                   icon: Send,         iconBg: 'bg-indigo-50',  iconColor: 'text-indigo-600' },
    { label: 'Active',    value: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,   icon: Activity,     iconBg: 'bg-blue-50',    iconColor: 'text-blue-600' },
    { label: 'Sent',      value: campaigns.filter(c => c.status === 'sent').length,                                  icon: CheckCircle2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
    { label: 'Drafts',    value: campaigns.filter(c => c.status === 'draft').length,                                 icon: Calendar,     iconBg: 'bg-amber-50',   iconColor: 'text-amber-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Campaigns</h1>
          <p className="page-subtitle">Create and manage your email campaigns</p>
        </div>
        <button
          onClick={() => { setEditingCampaign(null); setShowWizard(true); }}
          className="btn-gradient self-start sm:self-auto"
        >
          <Plus size={16} /> New Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="stat-card">
              <div className={`icon-box ${s.iconBg} mb-3`}>
                <Icon className={`w-[18px] h-[18px] ${s.iconColor}`} />
              </div>
              <p className="text-2xl font-semibold text-gray-900 tabular-nums">{s.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* Table / Empty State */}
      {campaigns.length === 0 ? (
        <div className="card text-center py-14">
          <div className="w-16 h-16 bg-surface-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Send className="w-8 h-8 text-gray-300" />
          </div>
          <p className="text-base font-semibold text-gray-700 mb-1">No campaigns yet</p>
          <p className="text-sm text-gray-400 mb-5">Create your first campaign to start reaching your audience</p>
          <button onClick={() => { setEditingCampaign(null); setShowWizard(true); }} className="btn-primary mx-auto">
            <Plus size={15} /> Create Campaign
          </button>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Campaign</th>
                  <th>Status</th>
                  <th>Recipients</th>
                  <th>Performance</th>
                  <th>Created</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const sent    = campaign.stats?.sent    || 0;
                  const opened  = campaign.stats?.opened  || 0;
                  const clicked = campaign.stats?.clicked || 0;
                  const or = sent > 0 ? ((opened / sent) * 100).toFixed(1) : null;
                  return (
                    <tr key={campaign.id}>
                      <td>
                        <p className="font-medium text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{campaign.subject}</p>
                      </td>
                      <td><StatusBadge status={campaign.status} /></td>
                      <td>
                        <span className="font-medium text-gray-700">{campaign.totalRecipients || 0}</span>
                        {(campaign.totalRecipients || 0) === 0 && (
                          <span className="ml-2 text-xs text-rose-500">No recipients</span>
                        )}
                      </td>
                      <td>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">Sent</span>
                            <span className="font-medium text-gray-700">{sent.toLocaleString()}</span>
                            <span className="text-gray-300">·</span>
                            <span className="text-gray-400">Opened</span>
                            <span className="font-medium text-emerald-600">{opened.toLocaleString()}</span>
                            {or !== null && (
                              <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${parseFloat(or) >= 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-50 text-gray-500'}`}>
                                {or}%
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-gray-400">Clicked</span>
                            <span className="font-medium text-violet-600">{clicked.toLocaleString()}</span>
                          </div>
                        </div>
                      </td>
                      <td className="text-gray-500">
                        {format(new Date(campaign.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-2">
                          {campaign.status === 'draft' && (
                            <button
                              onClick={() => updateCampaignStatus(campaign.id, 'sending')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                            >
                              <Play size={11} /> Send
                            </button>
                          )}
                          {(campaign.status === 'draft' || campaign.status === 'scheduled') && (
                            <button
                              onClick={() => { setEditingCampaign(campaign); setShowWizard(true); }}
                              title="Edit"
                              className="p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                            >
                              <Pencil size={15} />
                            </button>
                          )}
                          <button
                            onClick={() => duplicateCampaign(campaign.id)}
                            title="Duplicate"
                            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(campaign.id)}
                            title="Delete"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showWizard && (
        <CampaignWizard
          isOpen={showWizard}
          campaign={editingCampaign}
          onClose={() => { setShowWizard(false); setEditingCampaign(null); }}
        />
      )}
      {showProgress && activeCampaignId && (
        <CampaignProgress
          campaignId={activeCampaignId}
          onClose={() => {
            setShowProgress(false);
            setActiveCampaignId(null);
            initializeCampaigns();
          }}
        />
      )}
    </div>
  );
};

export default Campaigns;

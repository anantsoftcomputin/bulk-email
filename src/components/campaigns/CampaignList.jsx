import React, { useState } from 'react';
import { Plus, Play, Pause, Copy, Trash2, BarChart } from 'lucide-react';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { CampaignWizard } from './CampaignWizard';
import { useCampaignStore } from '../../store/campaignStore';
import { CAMPAIGN_STATUS } from '../../utils/constants';

export const CampaignList = () => {
  const { campaigns, deleteCampaign, updateCampaign } = useCampaignStore();
  const [showWizard, setShowWizard] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredCampaigns = campaigns.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-700',
      scheduled: 'bg-blue-100 text-blue-700',
      sending: 'bg-yellow-100 text-yellow-700',
      sent: 'bg-green-100 text-green-700',
      paused: 'bg-orange-100 text-orange-700',
      failed: 'bg-red-100 text-red-700'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Campaigns</h2>
          <p className="text-gray-500">{campaigns.length} total campaigns</p>
        </div>
        
        <Button icon={Plus} onClick={() => setShowWizard(true)}>
          Create Campaign
        </Button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'sending', 'sent'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`
                px-4 py-2 rounded-lg font-medium capitalize transition-colors
                ${filterStatus === status 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Campaign List */}
      <div className="space-y-4">
        {filteredCampaigns.map(campaign => (
          <div key={campaign.id} className="card hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {campaign.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {campaign.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-1">
                  <strong>Subject:</strong> {campaign.subject}
                </p>
                <p className="text-sm text-gray-500">
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                {campaign.status === 'draft' && (
                  <Button size="sm" icon={Play}>
                    Send
                  </Button>
                )}
                {campaign.status === 'sending' && (
                  <Button size="sm" variant="outline" icon={Pause}>
                    Pause
                  </Button>
                )}
                <Button size="sm" variant="outline" icon={Copy}>
                  Duplicate
                </Button>
                <Button size="sm" variant="outline" icon={BarChart}>
                  Stats
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  icon={Trash2}
                  onClick={() => {
                    if (window.confirm('Delete this campaign?')) {
                      deleteCampaign(campaign.id);
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>

            {/* Stats */}
            {campaign.stats && (
              <div className="grid grid-cols-6 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-gray-500">Sent</p>
                  <p className="text-xl font-semibold">{campaign.stats.sent}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Delivered</p>
                  <p className="text-xl font-semibold">{campaign.stats.delivered}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Opened</p>
                  <p className="text-xl font-semibold">
                    {campaign.stats.opened}
                    <span className="text-sm text-gray-500 ml-1">
                      ({campaign.stats.delivered > 0 
                        ? ((campaign.stats.opened / campaign.stats.delivered) * 100).toFixed(1)
                        : 0}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Clicked</p>
                  <p className="text-xl font-semibold">
                    {campaign.stats.clicked}
                    <span className="text-sm text-gray-500 ml-1">
                      ({campaign.stats.opened > 0 
                        ? ((campaign.stats.clicked / campaign.stats.opened) * 100).toFixed(1)
                        : 0}%)
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Bounced</p>
                  <p className="text-xl font-semibold text-red-600">{campaign.stats.bounced}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unsubscribed</p>
                  <p className="text-xl font-semibold text-orange-600">{campaign.stats.unsubscribed}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Wizard Modal */}
      <Modal
        isOpen={showWizard}
        onClose={() => setShowWizard(false)}
        title="Create New Campaign"
        size="xl"
      >
        <CampaignWizard onClose={() => setShowWizard(false)} />
      </Modal>
    </div>
  );
};
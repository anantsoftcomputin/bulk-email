import { create } from 'zustand';
import { CAMPAIGN_STATUS } from '../utils/constants';
import { sampleCampaigns } from '../utils/sampleData';

export const useCampaignStore = create((set, get) => ({
  campaigns: sampleCampaigns,
  selectedCampaign: null,
  filters: {
    status: null,
    search: '',
    dateRange: null,
  },
  isLoading: false,
  error: null,

  // Set campaigns
  setCampaigns: (campaigns) => set({ campaigns }),

  // Add campaign
  addCampaign: (campaign) => {
    const newCampaign = {
      ...campaign,
      id: Date.now().toString(),
      status: CAMPAIGN_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      },
    };
    set((state) => ({
      campaigns: [newCampaign, ...state.campaigns],
    }));
    return newCampaign;
  },

  // Update campaign
  updateCampaign: (id, updates) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id
          ? { ...campaign, ...updates, updatedAt: new Date().toISOString() }
          : campaign
      ),
    }));
  },

  // Delete campaign
  deleteCampaign: (id) => {
    set((state) => ({
      campaigns: state.campaigns.filter((campaign) => campaign.id !== id),
      selectedCampaign: state.selectedCampaign?.id === id ? null : state.selectedCampaign,
    }));
  },

  // Update campaign status
  updateCampaignStatus: (id, status) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              status,
              updatedAt: new Date().toISOString(),
              ...(status === CAMPAIGN_STATUS.SENT && { sentAt: new Date().toISOString() }),
            }
          : campaign
      ),
    }));
  },

  // Update campaign stats
  updateCampaignStats: (id, stats) => {
    set((state) => ({
      campaigns: state.campaigns.map((campaign) =>
        campaign.id === id
          ? {
              ...campaign,
              stats: { ...campaign.stats, ...stats },
              updatedAt: new Date().toISOString(),
            }
          : campaign
      ),
    }));
  },

  // Duplicate campaign
  duplicateCampaign: (id) => {
    const campaign = get().campaigns.find((c) => c.id === id);
    if (!campaign) return null;

    const duplicated = {
      ...campaign,
      id: Date.now().toString(),
      name: `${campaign.name} (Copy)`,
      status: CAMPAIGN_STATUS.DRAFT,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sentAt: null,
      stats: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        bounced: 0,
        failed: 0,
        unsubscribed: 0,
        openRate: 0,
        clickRate: 0,
        bounceRate: 0,
      },
    };

    set((state) => ({
      campaigns: [duplicated, ...state.campaigns],
    }));

    return duplicated;
  },

  // Select campaign
  selectCampaign: (campaign) => set({ selectedCampaign: campaign }),

  // Get campaign by ID
  getCampaignById: (id) => {
    return get().campaigns.find((c) => c.id === id);
  },

  // Filters
  setFilters: (filters) => {
    set((state) => ({
      filters: { ...state.filters, ...filters },
    }));
  },

  clearFilters: () => {
    set({
      filters: {
        status: null,
        search: '',
        dateRange: null,
      },
    });
  },

  // Get filtered campaigns
  getFilteredCampaigns: () => {
    const { campaigns, filters } = get();
    let filtered = [...campaigns];

    if (filters.status) {
      filtered = filtered.filter((campaign) => campaign.status === filters.status);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (campaign) =>
          campaign.name?.toLowerCase().includes(search) ||
          campaign.subject?.toLowerCase().includes(search)
      );
    }

    if (filters.dateRange) {
      const { start, end } = filters.dateRange;
      filtered = filtered.filter((campaign) => {
        const date = new Date(campaign.createdAt);
        return date >= start && date <= end;
      });
    }

    return filtered;
  },

  // Get campaigns by status
  getCampaignsByStatus: (status) => {
    return get().campaigns.filter((c) => c.status === status);
  },

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

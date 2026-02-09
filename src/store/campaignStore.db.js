import { create } from 'zustand';
import { dbHelpers } from '../db/database';

export const useCampaignStore = create((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  isLoading: false,
  error: null,

  // Initialize campaigns from database
  initializeCampaigns: async () => {
    set({ isLoading: true, error: null });
    try {
      const campaigns = await dbHelpers.getAllCampaigns();
      set({ campaigns, isLoading: false });
    } catch (error) {
      console.error('Error loading campaigns:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Add campaign
  addCampaign: async (campaign) => {
    set({ isLoading: true, error: null });
    try {
      const id = await dbHelpers.createCampaign(campaign);
      const newCampaign = await dbHelpers.getCampaignById(id);
      set((state) => ({
        campaigns: [newCampaign, ...state.campaigns],
        isLoading: false
      }));
      return newCampaign;
    } catch (error) {
      console.error('Error adding campaign:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update campaign
  updateCampaign: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await dbHelpers.updateCampaign(id, updates);
      set((state) => ({
        campaigns: state.campaigns.map(c => c.id === id ? updated : c),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      console.error('Error updating campaign:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete campaign
  deleteCampaign: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.deleteCampaign(id);
      set((state) => ({
        campaigns: state.campaigns.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Set selected campaign
  setSelectedCampaign: (campaign) => set({ selectedCampaign: campaign }),

  // Get campaign by ID
  getCampaignById: async (id) => {
    try {
      return await dbHelpers.getCampaignById(id);
    } catch (error) {
      console.error('Error getting campaign:', error);
      throw error;
    }
  },

  // Get campaign recipients
  getCampaignRecipients: async (campaignId) => {
    try {
      return await dbHelpers.getCampaignRecipients(campaignId);
    } catch (error) {
      console.error('Error getting campaign recipients:', error);
      throw error;
    }
  },

  // Get campaigns by status
  getCampaignsByStatus: (status) => {
    const { campaigns } = get();
    return campaigns.filter(c => c.status === status);
  },

  // Sync campaign stats from tracking events
  syncCampaignStats: async (campaignId) => {
    try {
      // Get tracking events for this campaign from Firestore
      const trackingEvents = await dbHelpers.getTrackingEvents(campaignId);
      
      // Count opens and clicks
      const opens = trackingEvents.filter(e => e.type === 'open').length;
      const clicks = trackingEvents.filter(e => e.type === 'click').length;
      
      // Update campaign stats
      const campaign = await dbHelpers.getCampaignById(campaignId);
      if (campaign) {
        const updatedStats = {
          ...campaign.stats,
          opened: opens,
          clicked: clicks,
        };
        
        await dbHelpers.updateCampaign(campaignId, { stats: updatedStats });
        
        // Update store
        set((state) => ({
          campaigns: state.campaigns.map(c => 
            c.id === campaignId ? { ...c, stats: updatedStats } : c
          ),
        }));
      }
    } catch (error) {
      console.error('Error syncing campaign stats:', error);
    }
  },

  // Sync all campaign stats
  syncAllCampaignStats: async () => {
    const { campaigns } = get();
    for (const campaign of campaigns) {
      await get().syncCampaignStats(campaign.id);
    }
  },
}));

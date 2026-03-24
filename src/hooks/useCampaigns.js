import { useCampaignStore } from '../store/campaignStore.db';

export const useCampaigns = () => {
  const {
    campaigns,
    selectedCampaign,
    isLoading,
    error,
    initializeCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    setSelectedCampaign,
    getCampaignById,
    getCampaignRecipients,
    getCampaignsByStatus,
  } = useCampaignStore();

  return {
    campaigns,
    selectedCampaign,
    isLoading,
    error,
    initializeCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    setSelectedCampaign,
    getCampaignById,
    getCampaignRecipients,
    getCampaignsByStatus,
  };
};

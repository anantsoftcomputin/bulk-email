import { create } from 'zustand';
import { dbHelpers } from '../db/database';

export const useSMTPStore = create((set, get) => ({
  smtpConfigs: [],
  selectedConfig: null,
  isLoading: false,
  error: null,

  // Initialize SMTP configs from database
  initializeSMTPConfigs: async () => {
    set({ isLoading: true, error: null });
    try {
      const smtpConfigs = await dbHelpers.getAllSMTPConfigs();
      set({ smtpConfigs, isLoading: false });
    } catch (error) {
      console.error('Error loading SMTP configs:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Add SMTP config
  addSMTPConfig: async (config) => {
    set({ isLoading: true, error: null });
    try {
      const id = await dbHelpers.createSMTPConfig(config);
      const newConfig = await dbHelpers.getSMTPConfigById(id);
      set((state) => ({
        smtpConfigs: [newConfig, ...state.smtpConfigs],
        isLoading: false
      }));
      return newConfig;
    } catch (error) {
      console.error('Error adding SMTP config:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update SMTP config
  updateSMTPConfig: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await dbHelpers.updateSMTPConfig(id, updates);
      set((state) => ({
        smtpConfigs: state.smtpConfigs.map(c => c.id === id ? updated : c),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      console.error('Error updating SMTP config:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete SMTP config
  deleteSMTPConfig: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.deleteSMTPConfig(id);
      set((state) => ({
        smtpConfigs: state.smtpConfigs.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting SMTP config:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Set selected config
  setSelectedConfig: (config) => set({ selectedConfig: config }),

  // Get default SMTP config
  getDefaultSMTPConfig: async () => {
    try {
      return await dbHelpers.getDefaultSMTPConfig();
    } catch (error) {
      console.error('Error getting default SMTP config:', error);
      throw error;
    }
  },
}));

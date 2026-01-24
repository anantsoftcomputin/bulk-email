import { create } from 'zustand';
import { dbHelpers } from '../db/database';

export const useTemplateStore = create((set, get) => ({
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,

  // Initialize templates from database
  initializeTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await dbHelpers.getAllTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Error loading templates:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Add template
  addTemplate: async (template) => {
    set({ isLoading: true, error: null });
    try {
      const id = await dbHelpers.createTemplate(template);
      const newTemplate = await dbHelpers.getTemplateById(id);
      set((state) => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false
      }));
      return newTemplate;
    } catch (error) {
      console.error('Error adding template:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update template
  updateTemplate: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await dbHelpers.updateTemplate(id, updates);
      set((state) => ({
        templates: state.templates.map(t => t.id === id ? updated : t),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      console.error('Error updating template:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete template
  deleteTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.deleteTemplate(id);
      set((state) => ({
        templates: state.templates.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting template:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Set selected template
  setSelectedTemplate: (template) => set({ selectedTemplate: template }),

  // Get template by ID
  getTemplateById: async (id) => {
    try {
      return await dbHelpers.getTemplateById(id);
    } catch (error) {
      console.error('Error getting template:', error);
      throw error;
    }
  },
}));

import { create } from 'zustand';
import { dbHelpers } from '../db/database';
import { sampleTemplates } from '../utils/sampleData';

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
      if (templates.length === 0) {
        // Seed starter templates once (guard with a setting so deliberate clears aren't re-seeded)
        const alreadySeeded = await dbHelpers.getSetting('starterTemplatesSeeded');
        if (!alreadySeeded) {
          const now = new Date().toISOString();
          for (const t of sampleTemplates) {
            const { id: _id, ...rest } = t;
            await dbHelpers.createTemplate({ ...rest, createdAt: now, updatedAt: now });
          }
          await dbHelpers.setSetting('starterTemplatesSeeded', true);
          const seeded = await dbHelpers.getAllTemplates();
          set({ templates: seeded, isLoading: false });
          return;
        }
      }
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Error loading templates:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Load starter templates on demand (for users who already have data)
  loadStarterTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const now = new Date().toISOString();
      for (const t of sampleTemplates) {
        const { id: _id, ...rest } = t;
        await dbHelpers.createTemplate({ ...rest, createdAt: now, updatedAt: now });
      }
      await dbHelpers.setSetting('starterTemplatesSeeded', true);
      const templates = await dbHelpers.getAllTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      console.error('Error loading starter templates:', error);
      set({ isLoading: false, error: error.message });
      throw error;
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

  // Duplicate template
  duplicateTemplate: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const original = await dbHelpers.getTemplateById(id);
      if (!original) throw new Error('Template not found');
      const { id: _id, createdAt, updatedAt, ...rest } = original;
      const newTemplate = {
        ...rest,
        name: `${original.name} (Copy)`,
        status: 'draft',
      };
      const newId = await dbHelpers.createTemplate(newTemplate);
      const created = await dbHelpers.getTemplateById(newId);
      set((state) => ({
        templates: [created, ...state.templates],
        isLoading: false,
      }));
      return created;
    } catch (error) {
      console.error('Error duplicating template:', error);
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

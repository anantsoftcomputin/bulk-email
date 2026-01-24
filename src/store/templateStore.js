import { create } from 'zustand';
import { sampleTemplates } from '../utils/sampleData';

export const useTemplateStore = create((set, get) => ({
  templates: sampleTemplates,
  selectedTemplate: null,
  isLoading: false,
  error: null,

  // Set templates
  setTemplates: (templates) => set({ templates }),

  // Add template
  addTemplate: (template) => {
    const newTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variables: extractVariables(template.htmlContent),
    };
    set((state) => ({
      templates: [newTemplate, ...state.templates],
    }));
    return newTemplate;
  },

  // Update template
  updateTemplate: (id, updates) => {
    set((state) => ({
      templates: state.templates.map((template) =>
        template.id === id
          ? {
              ...template,
              ...updates,
              updatedAt: new Date().toISOString(),
              variables: extractVariables(updates.htmlContent || template.htmlContent),
            }
          : template
      ),
    }));
  },

  // Delete template
  deleteTemplate: (id) => {
    set((state) => ({
      templates: state.templates.filter((template) => template.id !== id),
      selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate,
    }));
  },

  // Duplicate template
  duplicateTemplate: (id) => {
    const template = get().templates.find((t) => t.id === id);
    if (!template) return null;

    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      templates: [duplicated, ...state.templates],
    }));

    return duplicated;
  },

  // Select template
  selectTemplate: (template) => set({ selectedTemplate: template }),

  // Get template by ID
  getTemplateById: (id) => {
    return get().templates.find((t) => t.id === id);
  },

  // Search templates
  searchTemplates: (query) => {
    const { templates } = get();
    if (!query) return templates;

    const search = query.toLowerCase();
    return templates.filter(
      (template) =>
        template.name?.toLowerCase().includes(search) ||
        template.subject?.toLowerCase().includes(search) ||
        template.description?.toLowerCase().includes(search)
    );
  },

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

// Helper to extract variables from template
const extractVariables = (content) => {
  if (!content) return [];
  const regex = /\{\{(\w+)\}\}/g;
  const matches = content.matchAll(regex);
  const variables = new Set();
  for (const match of matches) {
    variables.add(match[1]);
  }
  return Array.from(variables);
};

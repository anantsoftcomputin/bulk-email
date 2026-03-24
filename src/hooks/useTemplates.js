import { useTemplateStore } from '../store/templateStore.db';

export const useTemplates = () => {
  const {
    templates,
    selectedTemplate,
    isLoading,
    error,
    initializeTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setSelectedTemplate,
  } = useTemplateStore();

  return {
    templates,
    selectedTemplate,
    isLoading,
    error,
    initializeTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    duplicateTemplate,
    setSelectedTemplate,
  };
};

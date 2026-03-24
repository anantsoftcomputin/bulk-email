import { useContactStore } from '../store/contactStore.db';

export const useContacts = () => {
  const {
    contacts,
    isLoading,
    error,
    filters,
    setFilters,
    initializeContacts,
    addContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
  } = useContactStore();

  return {
    contacts,
    isLoading,
    error,
    filters,
    setFilters,
    initializeContacts,
    addContact,
    updateContact,
    deleteContact,
    bulkDeleteContacts,
  };
};

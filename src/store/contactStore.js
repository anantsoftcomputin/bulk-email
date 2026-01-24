import { create } from 'zustand';
import { sampleContacts } from '../utils/sampleData';

export const useContactStore = create((set, get) => ({
  contacts: sampleContacts,
  selectedContacts: [],
  filters: {
    search: '',
    group: null,
    tags: [],
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
  },
  isLoading: false,
  error: null,

  // Set contacts
  setContacts: (contacts) => set({ contacts }),

  // Add contact
  addContact: (contact) => {
    const newContact = {
      ...contact,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({
      contacts: [newContact, ...state.contacts],
    }));
    return newContact;
  },

  // Update contact
  updateContact: (id, updates) => {
    set((state) => ({
      contacts: state.contacts.map((contact) =>
        contact.id === id
          ? { ...contact, ...updates, updatedAt: new Date().toISOString() }
          : contact
      ),
    }));
  },

  // Delete contact
  deleteContact: (id) => {
    set((state) => ({
      contacts: state.contacts.filter((contact) => contact.id !== id),
      selectedContacts: state.selectedContacts.filter((cid) => cid !== id),
    }));
  },

  // Bulk delete contacts
  bulkDeleteContacts: (ids) => {
    set((state) => ({
      contacts: state.contacts.filter((contact) => !ids.includes(contact.id)),
      selectedContacts: state.selectedContacts.filter((id) => !ids.includes(id)),
    }));
  },

  // Import contacts
  importContacts: (newContacts) => {
    const contactsWithIds = newContacts.map((contact) => ({
      ...contact,
      id: contact.id || Date.now().toString() + Math.random(),
      createdAt: contact.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    set((state) => ({
      contacts: [...contactsWithIds, ...state.contacts],
    }));
    
    return contactsWithIds;
  },

  // Select/Deselect contacts
  toggleSelectContact: (id) => {
    set((state) => ({
      selectedContacts: state.selectedContacts.includes(id)
        ? state.selectedContacts.filter((cid) => cid !== id)
        : [...state.selectedContacts, id],
    }));
  },

  selectAllContacts: () => {
    const allIds = get().contacts.map((c) => c.id);
    set({ selectedContacts: allIds });
  },

  deselectAllContacts: () => {
    set({ selectedContacts: [] });
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
        search: '',
        group: null,
        tags: [],
      },
    });
  },

  // Pagination
  setPagination: (pagination) => {
    set((state) => ({
      pagination: { ...state.pagination, ...pagination },
    }));
  },

  // Get filtered contacts
  getFilteredContacts: () => {
    const { contacts, filters } = get();
    let filtered = [...contacts];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.email?.toLowerCase().includes(search) ||
          contact.firstName?.toLowerCase().includes(search) ||
          contact.lastName?.toLowerCase().includes(search) ||
          contact.company?.toLowerCase().includes(search)
      );
    }

    if (filters.group) {
      filtered = filtered.filter((contact) =>
        contact.groups?.includes(filters.group)
      );
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter((contact) =>
        filters.tags.some((tag) => contact.tags?.includes(tag))
      );
    }

    return filtered;
  },

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));

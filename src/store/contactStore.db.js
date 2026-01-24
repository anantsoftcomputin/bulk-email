import { create } from 'zustand';
import { dbHelpers } from '../db/database';

export const useContactStore = create((set, get) => ({
  contacts: [],
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

  // Initialize contacts from database
  initializeContacts: async () => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await dbHelpers.getAllContacts();
      set({ 
        contacts, 
        isLoading: false,
        pagination: { ...get().pagination, total: contacts.length }
      });
    } catch (error) {
      console.error('Error loading contacts:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Add contact
  addContact: async (contact) => {
    set({ isLoading: true, error: null });
    try {
      const id = await dbHelpers.createContact(contact);
      const newContact = await dbHelpers.getContactById(id);
      set((state) => ({ 
        contacts: [newContact, ...state.contacts],
        isLoading: false 
      }));
      return newContact;
    } catch (error) {
      console.error('Error adding contact:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update contact
  updateContact: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await dbHelpers.updateContact(id, updates);
      set((state) => ({
        contacts: state.contacts.map(c => c.id === id ? updated : c),
        isLoading: false
      }));
      return updated;
    } catch (error) {
      console.error('Error updating contact:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete contact
  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.deleteContact(id);
      set((state) => ({
        contacts: state.contacts.filter(c => c.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting contact:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Bulk delete contacts
  bulkDeleteContacts: async (ids) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.bulkDeleteContacts(ids);
      set((state) => ({
        contacts: state.contacts.filter(c => !ids.includes(c.id)),
        selectedContacts: [],
        isLoading: false
      }));
    } catch (error) {
      console.error('Error bulk deleting contacts:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Search contacts
  searchContacts: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const contacts = await dbHelpers.searchContacts(query);
      set({ contacts, isLoading: false });
    } catch (error) {
      console.error('Error searching contacts:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Set selected contacts
  setSelectedContacts: (contacts) => set({ selectedContacts: contacts }),

  // Set filters
  setFilters: (filters) => set({ filters: { ...get().filters, ...filters } }),

  // Reset filters
  resetFilters: () => set({
    filters: {
      search: '',
      group: null,
      tags: [],
    },
  }),

  // Get filtered contacts
  getFilteredContacts: () => {
    const { contacts, filters } = get();
    let filtered = [...contacts];

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(c =>
        c.email?.toLowerCase().includes(search) ||
        c.firstName?.toLowerCase().includes(search) ||
        c.lastName?.toLowerCase().includes(search)
      );
    }

    if (filters.group) {
      filtered = filtered.filter(c => c.groupId === filters.group);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(c =>
        c.tags?.some(tag => filters.tags.includes(tag))
      );
    }

    return filtered;
  },
}));

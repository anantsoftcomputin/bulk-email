import { create } from 'zustand';
import { dbHelpers } from '../db/database';

export const useGroupStore = create((set, get) => ({
  groups: [],
  selectedGroup: null,
  isLoading: false,
  error: null,

  // Initialize groups from database
  initializeGroups: async () => {
    set({ isLoading: true, error: null });
    try {
      const groups = await dbHelpers.getAllGroups();
      // Add contact count to each group
      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          const contacts = await dbHelpers.getGroupContacts(group.id);
          return { ...group, contactCount: contacts.length };
        })
      );
      set({ groups: groupsWithCounts, isLoading: false });
    } catch (error) {
      console.error('Error loading groups:', error);
      set({ isLoading: false, error: error.message });
    }
  },

  // Add group
  addGroup: async (group) => {
    set({ isLoading: true, error: null });
    try {
      const id = await dbHelpers.createGroup(group);
      const newGroup = await dbHelpers.getGroupById(id);
      // Add contactCount to new group
      const contacts = await dbHelpers.getGroupContacts(id);
      const groupWithCount = { ...newGroup, contactCount: contacts.length };
      
      set((state) => ({
        groups: [groupWithCount, ...state.groups],
        isLoading: false
      }));
      return groupWithCount;
    } catch (error) {
      console.error('Error adding group:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Update group
  updateGroup: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await dbHelpers.updateGroup(id, updates);
      // Recalculate contact count
      const contacts = await dbHelpers.getGroupContacts(id);
      const groupWithCount = { ...updated, contactCount: contacts.length };
      
      set((state) => ({
        groups: state.groups.map(g => g.id === id ? groupWithCount : g),
        isLoading: false
      }));
      return groupWithCount;
    } catch (error) {
      console.error('Error updating group:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Delete group
  deleteGroup: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dbHelpers.deleteGroup(id);
      set((state) => ({
        groups: state.groups.filter(g => g.id !== id),
        isLoading: false
      }));
    } catch (error) {
      console.error('Error deleting group:', error);
      set({ isLoading: false, error: error.message });
      throw error;
    }
  },

  // Set selected group
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  // Get group contacts
  getGroupContacts: async (groupId) => {
    try {
      return await dbHelpers.getGroupContacts(groupId);
    } catch (error) {
      console.error('Error getting group contacts:', error);
      throw error;
    }
  },

  // Refresh contact counts for all groups
  refreshContactCounts: async () => {
    try {
      const groups = get().groups;
      const groupsWithCounts = await Promise.all(
        groups.map(async (group) => {
          const contacts = await dbHelpers.getGroupContacts(group.id);
          return { ...group, contactCount: contacts.length };
        })
      );
      set({ groups: groupsWithCounts });
    } catch (error) {
      console.error('Error refreshing contact counts:', error);
    }
  },
}));

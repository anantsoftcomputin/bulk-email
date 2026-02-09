import { create } from 'zustand';
import authService from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true, // true while checking initial auth state
  error: null,

  /**
   * Initialize auth state listener — call once on app mount
   */
  initializeAuth: () => {
    return authService.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        set({
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    });
  },

  /**
   * Register with email and password
   */
  register: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.register(email, password, displayName);
      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.login(email, password);
      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Login with Google
   */
  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const firebaseUser = await authService.loginWithGoogle();
      set({
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Logout
   */
  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    } catch (error) {
      set({ isLoading: false, error: error.message });
    }
  },

  /**
   * Reset password
   */
  resetPassword: async (email) => {
    set({ isLoading: true, error: null });
    try {
      await authService.resetPassword(email);
      set({ isLoading: false });
    } catch (error) {
      const message = getFirebaseErrorMessage(error.code);
      set({ isLoading: false, error: message });
      throw new Error(message);
    }
  },

  /**
   * Update user profile
   */
  updateUser: async (updates) => {
    try {
      await authService.updateUserProfile(updates);
      set((state) => ({
        user: { ...state.user, ...updates },
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    }
  },

  /**
   * Clear errors
   */
  clearError: () => set({ error: null }),
}));

/**
 * Convert Firebase error codes to user-friendly messages
 */
function getFirebaseErrorMessage(code) {
  const messages = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/email-already-in-use': 'An account with this email already exists.',
    'auth/weak-password': 'Password should be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/network-request-failed': 'Network error. Check your connection.',
    'auth/popup-closed-by-user': 'Sign-in popup was closed.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled.',
    'auth/invalid-credential': 'Invalid email or password.',
  };
  return messages[code] || 'An unexpected error occurred. Please try again.';
}

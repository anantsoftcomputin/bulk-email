import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();

const authService = {
  /**
   * Register a new user with email and password
   */
  async register(email, password, displayName) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name
    await updateProfile(userCredential.user, { displayName });
    // Send email verification
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  },

  /**
   * Sign in with email and password
   */
  async login(email, password) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  /**
   * Sign in with Google
   */
  async loginWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  },

  /**
   * Sign out the current user
   */
  async logout() {
    await signOut(auth);
  },

  /**
   * Send password reset email
   */
  async resetPassword(email) {
    await sendPasswordResetEmail(auth, email);
  },

  /**
   * Update user profile
   */
  async updateUserProfile(updates) {
    if (!auth.currentUser) throw new Error('No user logged in');
    await updateProfile(auth.currentUser, updates);
    return auth.currentUser;
  },

  /**
   * Subscribe to auth state changes
   * @param {Function} callback - Called with user object or null
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  /**
   * Get the current user
   */
  getCurrentUser() {
    return auth.currentUser;
  },

  /**
   * Get Firebase ID token for API calls
   */
  async getIdToken() {
    if (!auth.currentUser) return null;
    return auth.currentUser.getIdToken();
  },
};

export default authService;

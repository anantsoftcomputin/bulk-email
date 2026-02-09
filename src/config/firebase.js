import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyB9spE_tHCa-Ph96DDnYxQX_7GzHSbGBGQ",
  authDomain: "mados-7cc5b.firebaseapp.com",
  projectId: "mados-7cc5b",
  storageBucket: "mados-7cc5b.firebasestorage.app",
  messagingSenderId: "969407470784",
  appId: "1:969407470784:web:894637ccb2066f7677a125",
  measurementId: "G-GW0P5LPRS6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore (for tracking events)
export const firestore = getFirestore(app);

// Initialize Analytics (only in browser, not SSR)
let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { analytics };
export default app;

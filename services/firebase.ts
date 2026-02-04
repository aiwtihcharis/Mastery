import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Note: In a real app, these would come from process.env
// For this demo, we check if the global config exists from the user's snippet
// or we fall back to a dummy config to prevent crashes (making the app purely frontend demo mode if no keys)

const getFirebaseConfig = () => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.__firebase_config) {
     // @ts-ignore
    return JSON.parse(window.__firebase_config);
  }
  
  // Return null if no config found, App will handle "Demo Mode"
  return null;
};

const config = getFirebaseConfig();

export const app = config ? initializeApp(config) : null;
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const APP_ID = 'js-mastery-saas';
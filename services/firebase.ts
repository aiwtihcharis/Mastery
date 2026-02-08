import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Explicit configuration provided for Mastery App
const firebaseConfig = {
  apiKey: "AIzaSyD0D2zNYjakT-GAxatF38cbv6nVFAn09Ms",
  authDomain: "mastery---learn-js-with-ai.firebaseapp.com",
  projectId: "mastery---learn-js-with-ai",
  storageBucket: "mastery---learn-js-with-ai.firebasestorage.app",
  messagingSenderId: "230451829887",
  appId: "1:230451829887:web:f2880d6bc066bd899a734a",
  measurementId: "G-29QKL56EZ7"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Initialize analytics only in browser environment to prevent SSR issues
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export const googleProvider = new GoogleAuthProvider();

export const APP_ID = 'js-mastery-saas';

// --- Auth Helpers ---

export const loginEmail = async (email: string, pass: string) => {
  return signInWithEmailAndPassword(auth, email, pass);
};

export const registerEmail = async (email: string, pass: string) => {
  return createUserWithEmailAndPassword(auth, email, pass);
};

export const updateUser = async (user: User, name: string) => {
  return updateProfile(user, { displayName: name });
};
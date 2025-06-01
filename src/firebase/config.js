import {
  getReactNativePersistence,
  initializeAuth,
} from 'firebase/auth';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
// 🔥 Tu configuración
const firebaseConfig = {
  apiKey: "AIzaSyBBnsVAnwzPkngJzuAaIw6FSqUGJLC411U",
  authDomain: "mimapagourmet.firebaseapp.com",
  projectId: "mimapagourmet",
  storageBucket: "mimapagourmet.firebasestorage.app",
  messagingSenderId: "339275815346",
  appId: "1:339275815346:web:ab47e924317714b38f2cab"
};

const app = initializeApp(firebaseConfig);

// ✅ Solo usás initializeAuth una vez, con persistencia (no uses getAuth)
const auth =null;

export { auth };
export const db = getFirestore(app);

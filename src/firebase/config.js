import {
  getReactNativePersistence,
  initializeAuth, 
} from 'firebase/auth';
import { initializeApp, } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
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
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth };
export const db = getFirestore(app);

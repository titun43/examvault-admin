// =============================================================================
// ExamVault - Firebase Client SDK (Admin Panel)
// Connects to the SAME Firebase project (examvaultnew) as the Flutter user app.
// Admin signs in with Email/Password; Firestore rules check admins/{uid} doc.
// No service account needed — all operations go through the client SDK and are
// enforced by Firestore/Storage security rules.
// =============================================================================

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBKEUGs9r7Q71q7vCIh3Pz_mletXQCok6E',
  authDomain: 'examvaultnew.firebaseapp.com',
  projectId: 'examvaultnew',
  storageBucket: 'examvaultnew.firebasestorage.app',
  messagingSenderId: '1047596633370',
  appId: '1:1047596633370:android:30d6b88cfed4b0bce8b0a3',
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;

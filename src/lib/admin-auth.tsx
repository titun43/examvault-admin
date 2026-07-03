'use client';

// =============================================================================
// ExamVault - Admin Auth Context
// Manages admin authentication state using Firebase Auth + Firestore.
// On sign-in, checks/creates the admins/{uid} doc (bootstrap for first admin).
// =============================================================================

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebase';

interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AdminAuthContextType {
  user: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  login: async () => ({ ok: false }),
  logout: async () => {},
});

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser: User | null) => {
      if (!fbUser) {
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      const adminUser: AdminUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
      };

      // Check if admins/{uid} doc exists.
      // NOTE: Firestore rules allow a signed-in user to read their OWN admins
      // doc. If the read fails (permission-denied), it means the user is NOT
      // an admin yet — fall through to the bootstrap path below.
      let alreadyAdmin = false;
      try {
        const adminDocRef = doc(db, 'admins', fbUser.uid);
        const adminDoc = await getDoc(adminDocRef);
        alreadyAdmin = adminDoc.exists();
      } catch (err) {
        // Permission denied = not an admin yet. Continue to bootstrap check.
        console.info('Admins doc read returned (likely not yet admin):', err);
      }

      if (alreadyAdmin) {
        setUser(adminUser);
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Bootstrap: for a canonical admin email, auto-create the admins doc
      // (Firestore rules allow any signed-in user to CREATE their own admins doc).
      // Accept the primary admin address and the owner's address (from app_config)
      // so the owner can also sign in as admin without a manual admins doc write.
      const canonicalAdminEmails = [
        'admin@examvault.com',
        'lkstudeoandcomputering@gmail.com',
      ];
      if (fbUser.email && canonicalAdminEmails.includes(fbUser.email.toLowerCase())) {
        try {
          const adminDocRef = doc(db, 'admins', fbUser.uid);
          await setDoc(adminDocRef, {
            email: fbUser.email,
            role: 'admin',
            createdAt: serverTimestamp(),
          });
          // Also ensure users/{uid} has role=admin
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (!userDoc.exists()) {
            await setDoc(userDocRef, {
              name: 'Admin',
              email: fbUser.email,
              role: 'admin',
              isPremium: true,
              subscriptionStatus: 'premium',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              isActive: true,
            });
          } else if (userDoc.data()?.role !== 'admin') {
            // Promote existing user to admin
            await setDoc(userDocRef, { role: 'admin', isPremium: true, subscriptionStatus: 'premium', updatedAt: serverTimestamp() }, { merge: true });
          }
          setUser(adminUser);
          setIsAdmin(true);
        } catch (err) {
          console.error('Admin bootstrap failed:', err);
          await fbSignOut(auth);
          setUser(null);
          setIsAdmin(false);
        }
      } else {
        // Not an admin and not the canonical admin email — sign out
        await fbSignOut(auth);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      // The onAuthStateChanged listener will handle the admin check + bootstrap.
      return { ok: true };
    } catch (err: any) {
      const code = err?.code || '';
      let msg = 'Login failed. Please check your credentials.';
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
        msg = 'Invalid email or password.';
      } else if (code === 'auth/too-many-requests') {
        msg = 'Too many failed attempts. Try again later or reset your password.';
      } else if (code === 'auth/network-request-failed') {
        msg = 'Network error. Check your internet connection.';
      } else if (code === 'auth/invalid-email') {
        msg = 'Invalid email format.';
      }
      return { ok: false, error: msg };
    }
  };

  const logout = async () => {
    await fbSignOut(auth);
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}

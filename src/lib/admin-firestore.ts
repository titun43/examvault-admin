// =============================================================================
// ExamVault - Admin Firestore/Storage helpers
// Shared utilities used by all admin CRUD components.
// =============================================================================

import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
  QueryConstraint,
  Timestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage';
import { db, storage } from './firebase';

// ==================== IMAGE UPLOAD ====================
export async function uploadImage(
  path: string,
  file: File,
): Promise<string> {
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(url: string): Promise<void> {
  try {
    const imageRef = ref(storage, url);
    await deleteObject(imageRef);
  } catch {
    // Ignore errors (image may not exist or URL may be external)
  }
}

// ==================== COLLECTION HELPERS ====================
// Subscribe to a collection with optional ordering. Returns an unsubscribe fn.
export function subscribeToCollection<T>(
  collectionName: string,
  callback: (items: T[]) => void,
  ...constraints: QueryConstraint[]
): () => void {
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);

  return onSnapshot(
    q as any,
    (snapshot) => {
      const items = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as T[];
      callback(items);
    },
    (err) => {
      console.error(`subscribeToCollection(${collectionName}) error:`, err);
      callback([]);
    },
  );
}

export async function fetchCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = constraints.length > 0
    ? query(collection(db, collectionName), ...constraints)
    : collection(db, collectionName);
  const snapshot = await getDocs(q as any);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as T[];
}

// Add a new document (Firestore auto-generates ID)
export async function addItem<T extends Record<string, any>>(
  collectionName: string,
  data: T,
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Set a document with a specific ID
export async function setItem<T extends Record<string, any>>(
  collectionName: string,
  id: string,
  data: T,
): Promise<void> {
  await setDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
}

export async function updateItem(
  collectionName: string,
  id: string,
  data: Record<string, any>,
): Promise<void> {
  await updateDoc(doc(db, collectionName, id), {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteItem(
  collectionName: string,
  id: string,
): Promise<void> {
  await deleteDoc(doc(db, collectionName, id));
}

// Bulk delete multiple documents from a collection in a single Firestore writeBatch.
// Firestore writeBatch limit is 500 ops per batch — this automatically chunks
// larger requests so callers can pass any number of ids safely.
export async function deleteItems(
  collectionName: string,
  ids: string[],
): Promise<void> {
  if (!ids.length) return;
  const BATCH_SIZE = 450; // safe margin under the 500-op Firestore limit
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const chunk = ids.slice(i, i + BATCH_SIZE);
    const batch = writeBatch(db);
    chunk.forEach((id) => batch.delete(doc(db, collectionName, id)));
    await batch.commit();
  }
}

// ==================== TIMESTAMP CONVERSION ====================
export function timestampToDate(ts: any): Date | null {
  if (!ts) return null;
  if (ts instanceof Timestamp) return ts.toDate();
  if (ts?.toDate) return ts.toDate();
  if (ts instanceof Date) return ts;
  if (typeof ts === 'string') return new Date(ts);
  if (typeof ts === 'number') return new Date(ts);
  return null;
}

export function dateToTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export function formatDate(ts: any): string {
  const d = timestampToDate(ts);
  if (!d) return '—';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(ts: any): string {
  const d = timestampToDate(ts);
  if (!d) return '—';
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Convert a Date or input value to an ISO string for <input type="datetime-local">
export function toDateTimeInputValue(ts: any): string {
  const d = timestampToDate(ts);
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function toDateTimeInputValueDate(d: Date | null): string {
  if (!d) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

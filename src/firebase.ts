import { initializeApp } from 'firebase/app';
import {
  initializeAuth,
  browserLocalPersistence,
  indexedDBLocalPersistence,
  browserPopupRedirectResolver,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFirebaseErrorMessage } from './utils/firebaseErrors';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// On native Capacitor (Android/iOS) use indexedDB as primary persistence so
// the auth session survives the Custom Tab round-trip used by signInWithRedirect.
// On web, keep browserLocalPersistence (localStorage) as usual.
export const auth = initializeAuth(app, {
  persistence: Capacitor.isNativePlatform()
    ? [indexedDBLocalPersistence, browserLocalPersistence]
    : browserLocalPersistence,
  popupRedirectResolver: browserPopupRedirectResolver,
});
export const db = getFirestore(app);
export const storage = getStorage(app);

export enum OperationType {
  GET = 'get',
  LIST = 'list',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  WRITE = 'write'
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null = null) {
  if (error instanceof Error && error.message.includes('Missing or insufficient permissions')) {
    // SEC-012 fix: never expose userId, email or provider info in error messages.
    // Log minimal debug info only in development, then throw a generic user-facing error.
    if (import.meta.env.DEV) {
      console.error('Firestore permission error:', {
        operationType,
        path,
        uid: auth.currentUser?.uid ?? 'unauthenticated',
      });
    }
    throw new Error('Permissão negada');
  }
  throw error;
}

// Ensure offline capability check for connection
import { doc, getDocFromServer } from 'firebase/firestore';

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();


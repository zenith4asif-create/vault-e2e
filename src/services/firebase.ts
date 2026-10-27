import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, User } from 'firebase/auth';
import { getDatabase, Database, ref, get, set } from 'firebase/database';
import { VaultBlob } from '../types/vault';

export const firebaseConfig = {
  apiKey: "AIzaSyB1UmmZPSaFeKOOhgZroXsLCBEJVaipTOw",
  authDomain: "p2ve-89ed0.firebaseapp.com",
  databaseURL: "https://p2ve-89ed0-default-rtdb.firebaseio.com",
  projectId: "p2ve-89ed0",
  storageBucket: "p2ve-89ed0.firebasestorage.app",
  messagingSenderId: "827708131608",
  appId: "1:827708131608:web:0d9350ab2ed655be2c366d"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Database | null = null;

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getDatabase(app);
} catch (error) {
  console.warn('Firebase initialization warning:', error);
}

export { app, auth, db };

export async function fetchVaultBlob(uid: string): Promise<VaultBlob | null> {
  if (!db) {
    const cached = localStorage.getItem(`vault_offline_${uid}`);
    return cached ? JSON.parse(cached) : null;
  }
  try {
    const snapshot = await get(ref(db, `users/${uid}/vault`));
    if (snapshot.exists()) {
      const val = snapshot.val();
      localStorage.setItem(`vault_offline_${uid}`, JSON.stringify(val));
      return val as VaultBlob;
    }
    return null;
  } catch (err) {
    console.warn('Firebase RTDB read error, attempting cached offline copy:', err);
    const cached = localStorage.getItem(`vault_offline_${uid}`);
    if (cached) return JSON.parse(cached) as VaultBlob;
    throw err;
  }
}

export async function saveVaultBlob(uid: string, blob: VaultBlob): Promise<void> {
  // Always update local cache for resilience
  localStorage.setItem(`vault_offline_${uid}`, JSON.stringify(blob));
  if (db) {
    await set(ref(db, `users/${uid}/vault`), blob);
  }
}

export function formatFriendlyAuthError(err: unknown): string {
  const code = (err && typeof err === 'object' && 'code' in err) ? String((err as { code: string }).code) : '';
  const map: Record<string, string> = {
    'auth/invalid-email': 'That email address format is invalid.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/user-not-found': 'No account found for those credentials.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/invalid-credential': 'Incorrect email or password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment.',
    'auth/network-request-failed': 'Network connection issue. Please verify connection.',
    'auth/internal-error': 'Authentication service error. Try again.'
  };
  return map[code] || (err instanceof Error ? err.message : 'Sign-in failed. Please verify credentials.');
}

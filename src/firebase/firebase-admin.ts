
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFunctions } from 'firebase/functions';

/**
 * Initializes the Firebase Admin SDK.
 * 
 * It checks if an app is already initialized. If not, it attempts to initialize
 * using the `FIREBASE_SERVICE_ACCOUNT` environment variable. This function is
 * designed to be called in server-side environments (like Server Actions or API routes)
 * where the environment variables are available.
 * 
 * @returns {App} The initialized Firebase Admin App instance.
 * @throws {Error} If the `FIREBASE_SERVICE_ACCOUNT` environment variable is not set.
 */
export function initializeFirebaseAdmin(): App {
  // If an app is already initialized, return it.
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

  // This should only be called in a server environment where service account is available.
  if (!serviceAccount) {
    throw new Error('Firebase Admin SDK initialization failed: The FIREBASE_SERVICE_ACCOUNT environment variable is not set.');
  }

  const credential = cert(JSON.parse(serviceAccount));

  return initializeApp({ credential });
}

export const auth = getAuth;
export const functions = getFunctions;

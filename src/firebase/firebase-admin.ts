
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

function initializeFirebaseAdmin(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }
  
  const credential = serviceAccount ? cert(JSON.parse(serviceAccount)) : undefined;

  // When credential is not passed, SDK will automatically look for credentials
  // from the environment. This is the correct behavior for App Hosting.
  return initializeApp(credential ? { credential } : undefined);
}

export { initializeFirebaseAdmin };

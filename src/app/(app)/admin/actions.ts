
'use server';

import { auth, functions } from '@/firebase/firebase-admin';
import { getFunctions, httpsCallable } from 'firebase/functions';
import type { UserRecord } from 'firebase-admin/auth';
import { initializeFirebaseAdmin } from '@/firebase/firebase-admin';

// Initialize the admin app right away in the server action file.
initializeFirebaseAdmin();

export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  disabled: boolean;
  creationTime: string;
};

export async function listAllUsers(): Promise<{ success: boolean; users?: AdminUser[]; error?: string; }> {
  try {
    const app = initializeFirebaseAdmin();
    const functionsInstance = getFunctions(app);
    const listUsersFunction = httpsCallable(functionsInstance, 'listUsers');
    const result = await listUsersFunction();
    const users = (result.data as any).users;
    return { success: true, users };
  } catch (error) {
    console.error('Error listing users:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

export async function updateUserDisabledStatus(uid: string, disabled: boolean): Promise<{ success: boolean; error?: string }> {
  try {
    // Prevent the admin from disabling their own account
    if (uid === 'I3Y3xDOVnwgK9zBwL8b1vIu0Aun2') { // This should be a secure check, e.g. against the current session's UID if possible
        const currentUser = await auth().getUser(uid);
        if (currentUser.email === 'kiyuenterprise@gmail.com') {
             return { success: false, error: "Cannot block the primary admin account." };
        }
    }
      
    await auth().updateUser(uid, { disabled });
    return { success: true };
  } catch (error) {
    console.error('Error updating user status:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

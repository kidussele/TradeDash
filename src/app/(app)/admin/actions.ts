
'use server';

import { auth } from 'firebase-admin';
import { initializeFirebaseAdmin } from '@/firebase/firebase-admin';
import type { UserRecord } from 'firebase-admin/auth';

// Initialize the admin app right away in the server action file.
// This will only be executed when the server action is called.
initializeFirebaseAdmin();

export type AdminUser = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  disabled: boolean;
  creationTime: string;
};

function toAdminUser(userRecord: UserRecord): AdminUser {
    return {
        uid: userRecord.uid,
        email: userRecord.email || 'N/A',
        displayName: userRecord.displayName || 'No Name',
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        creationTime: new Date(userRecord.metadata.creationTime).toLocaleDateString(),
    };
}


export async function listAllUsers(): Promise<{ success: boolean; users?: AdminUser[]; error?: string; }> {
  try {
    const userRecords = await auth().listUsers();
    const users = userRecords.users.map(toAdminUser);
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

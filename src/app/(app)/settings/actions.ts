
'use server';

import { auth } from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { initializeFirebaseAdmin } from '@/firebase/firebase-admin';

// Initialize the admin app right away in the server action file.
// This will only be executed when the server action is called.
initializeFirebaseAdmin();

export async function updateProfile(data: {
  displayName: string;
  photoURL?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      throw new Error('You must be logged in to update your profile.');
    }

    const decodedToken = await auth().verifySessionCookie(sessionCookie, true);
    const userId = decodedToken.uid;
    
    // 1. Update Firebase Auth user
    await auth().updateUser(userId, {
      displayName: data.displayName,
      photoURL: data.photoURL,
    });

    // 2. Update Firestore user profile document
    const userProfileRef = getFirestore().collection('users').doc(userId);
    await userProfileRef.update({
      displayName: data.displayName,
      photoURL: data.photoURL,
    });

    return { success: true };
  } catch (error) {
    console.error('Error updating profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { success: false, error: errorMessage };
  }
}

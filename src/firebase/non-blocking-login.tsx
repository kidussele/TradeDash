
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

type ErrorCallback = (error: FirebaseError) => void;

/** Initiate Google sign-in (non-blocking). */
export function initiateGoogleSignIn(authInstance: Auth, onError?: ErrorCallback): void {
  const provider = new GoogleAuthProvider();
  signInWithPopup(authInstance, provider).catch((error: FirebaseError) => {
    console.error('Google sign-in error:', error);
    onError?.(error);
  });
}

/** Initiate email/password sign-up (non-blocking). */
export function initiateEmailSignUp(authInstance: Auth, email: string, password: string, displayName: string, onError?: ErrorCallback): void {
  createUserWithEmailAndPassword(authInstance, email, password)
  .then((userCredential) => {
    // After creating the user, update their profile with the display name
    return updateProfile(userCredential.user, {
      displayName: displayName,
    });
  })
  .catch((error: FirebaseError) => {
    console.error('Email sign-up error:', error);
    onError?.(error);
  });
}

/** Initiate email/password sign-in (non-blocking). */
export function initiateEmailSignIn(authInstance: Auth, email: string, password: string, onError?: ErrorCallback): void {
  signInWithEmailAndPassword(authInstance, email, password).catch((error: FirebaseError) => {
    console.error('Email sign-in error:', error);
    onError?.(error);
  });
}

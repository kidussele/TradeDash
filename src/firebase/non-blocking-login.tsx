
'use client';
import {
  Auth, // Import Auth type for type hinting
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';

type ErrorCallback = (error: FirebaseError) => void;

/** Initiate anonymous sign-in (non-blocking). */
export function initiateAnonymousSignIn(authInstance: Auth, onError?: ErrorCallback): void {
  signInAnonymously(authInstance).catch((error: FirebaseError) => {
    console.error('Anonymous sign-in error:', error);
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


'use client';
import { useEffect } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

export function PresenceIndicator() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user) return;

    const userStatusRef = doc(firestore, 'userStatus', user.uid);
    const userProfileRef = doc(firestore, 'users', user.uid);

    // Using a non-blocking set to update presence and user profile.
    // This is useful for "fire-and-forget" updates like presence.
    setDocumentNonBlocking(userStatusRef, { online: true, lastChanged: serverTimestamp() }, { merge: true });

    // Set user profile info if it doesn't exist, helpful for anonymous users
    setDocumentNonBlocking(userProfileRef, {
        displayName: user.displayName || 'Anonymous User',
        email: user.email || 'anonymous@example.com',
        photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
        createdAt: serverTimestamp()
    }, { merge: true });

    const handleBeforeUnload = () => {
      setDocumentNonBlocking(userStatusRef, { online: false, lastChanged: serverTimestamp() }, { merge: true });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      // Set offline on unmount/cleanup
      setDocumentNonBlocking(userStatusRef, { online: false, lastChanged: serverTimestamp() }, { merge: true });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [user, firestore]);

  return null; // This component does not render anything
}

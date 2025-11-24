
'use client';
import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc, serverTimestamp, onDisconnect, set, ref, getDatabase } from 'firebase/database';
import { setDoc, getDoc } from 'firebase/firestore';

export function PresenceIndicator() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user) return;

    // Use the Realtime Database for presence because it has onDisconnect
    const db = getDatabase(firestore.app);
    const userStatusDatabaseRef = ref(db, 'status/' + user.uid);
    const userStatusFirestoreRef = doc(firestore, 'userStatus', user.uid);

    // Firestore timestamp for last seen
    const isOfflineForFirestore = {
        online: false,
        lastChanged: serverTimestamp(),
    };

    const isOnlineForFirestore = {
        online: true,
        lastChanged: serverTimestamp(),
    };

    // Realtime Database timestamp for last seen
    const isOfflineForDatabase = {
        online: false,
        lastChanged: {'.sv': 'timestamp'}, // RTDB server value
    };

    const isOnlineForDatabase = {
        online: true,
        lastChanged: {'.sv': 'timestamp'},
    };
    
    // Create a reference to the special '.info/connected' path
    const connectedRef = ref(db, '.info/connected');
    let unsubscribe: () => void;

    onDisconnect(userStatusDatabaseRef).set(isOfflineForDatabase).then(() => {
        set(userStatusDatabaseRef, isOnlineForDatabase);
        setDoc(userStatusFirestoreRef, isOnlineForFirestore, { merge: true });
    });
    
    // Also create user profile if it doesn't exist.
    const userProfileRef = doc(firestore, 'users', user.uid);
    getDoc(userProfileRef).then(docSnap => {
        if (!docSnap.exists()) {
            setDoc(userProfileRef, {
                displayName: user.displayName || 'Anonymous User',
                email: user.email || 'anonymous@example.com',
                photoURL: user.photoURL || `https://i.pravatar.cc/150?u=${user.uid}`,
                createdAt: serverTimestamp()
            }, { merge: true });
        }
    });

    const handleBeforeUnload = () => {
      set(userStatusDatabaseRef, isOfflineForDatabase);
      setDoc(userStatusFirestoreRef, isOfflineForFirestore, { merge: true });
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
        handleBeforeUnload();
        window.removeEventListener('beforeunload', handleBeforeUnload);
    };

  }, [user, firestore]);

  return null;
}

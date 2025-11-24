
'use client';
import { useEffect } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { onDisconnect, set, ref, getDatabase, onValue } from 'firebase/database';
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';

export function PresenceIndicator() {
  const { user } = useUser();
  const firestore = useFirestore();

  useEffect(() => {
    if (!user) return;

    // Get a reference to the Realtime Database
    const db = getDatabase(firestore.app);
    const userStatusDatabaseRef = ref(db, '/status/' + user.uid);

    // Get a reference to the Firestore document
    const userStatusFirestoreRef = doc(firestore, '/userStatus/' + user.uid);
    
    // Create a reference to the special '.info/connected' path in Realtime Database.
    // This path is a boolean value that is true when the client is connected and false when it's not.
    const connectedRef = ref(db, '.info/connected');
    
    const unsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // We're connected (or reconnected).
        // Set the user's presence database status to true.
        set(userStatusDatabaseRef, true);
        
        // When the client disconnects, set the user's presence status to a server timestamp.
        // This will be picked up by our Cloud Function, which will then update the
        // Firestore document.
        onDisconnect(userStatusDatabaseRef).set({
            lastChanged: admin.database.ServerValue.TIMESTAMP,
        });
        
        // Also update the Firestore document directly for immediate feedback.
        setDoc(userStatusFirestoreRef, {
            online: true,
            lastChanged: serverTimestamp(),
        }, { merge: true });
      }
    });

    // Also, create the user profile if it doesn't exist.
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

    // Clean up the listener when the component unmounts
    return () => {
      unsubscribe();
      // Set offline status one last time on cleanup, just in case.
      setDoc(userStatusFirestoreRef, { online: false, lastChanged: serverTimestamp() }, { merge: true });
    };

  }, [user, firestore]);

  return null;
}

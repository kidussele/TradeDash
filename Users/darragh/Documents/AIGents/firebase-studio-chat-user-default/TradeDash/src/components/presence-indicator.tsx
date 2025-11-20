
'use client';

import { useEffect, useRef } from 'react';
import { useUser, useFirestore, setDocumentNonBlocking } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';

export function PresenceIndicator() {
  const { user } = useUser();
  const firestore = useFirestore();
  const timeoutId = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !firestore) return;

    const userStatusRef = doc(firestore, 'userStatus', user.uid);

    // Set online status immediately
    setDocumentNonBlocking(userStatusRef, {
        status: 'online',
        lastChanged: serverTimestamp(),
    }, { merge: true });

    const goOffline = () => {
       setDocumentNonBlocking(userStatusRef, {
        status: 'offline',
        lastChanged: serverTimestamp(),
      }, { merge: true });
    };

    const goOnline = () => {
         setDocumentNonBlocking(userStatusRef, {
            status: 'online',
            lastChanged: serverTimestamp(),
        }, { merge: true });
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        goOffline();
      } else {
        goOnline();
      }
    };
    
    // Set user to offline when they close the tab/browser
    window.addEventListener('beforeunload', goOffline);

    // Listen for visibility changes (switching tabs)
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      // Cleanup: Set status to offline when component unmounts (e.g., logout)
      goOffline();
      window.removeEventListener('beforeunload', goOffline);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, [user, firestore]);

  return null; // This component does not render anything
}

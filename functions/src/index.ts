
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const firestore = admin.firestore();
const rtdb = admin.database();

/**
 * A Cloud Function that triggers when a user's Realtime Database
 * status changes. It updates the corresponding user's status in Firestore.
 */
export const onUserStatusChanged = functions.database
  .ref("/status/{uid}")
  .onUpdate(async (change, context) => {
    // Get the data from the Realtime Database event.
    const eventStatus = change.after.val();
    const uid = context.params.uid;

    // Get a reference to the Firestore document.
    const userStatusFirestoreRef = firestore.doc(`userStatus/${uid}`);

    // If the user is offline, the RTDB entry will be an object with a timestamp.
    // If they are online, it will just be `true`.
    const isOffline = typeof eventStatus !== "boolean";

    if (isOffline) {
      functions.logger.log(`User ${uid} went offline.`);
    } else {
      functions.logger.log(`User ${uid} came online.`);
    }

    // Update the Firestore document with the new status.
    // Use the Realtime Database server timestamp for consistency.
    return userStatusFirestoreRef.set({
      online: !isOffline,
      lastChanged: admin.firestore.FieldValue.serverTimestamp(),
    }, {merge: true});
  });

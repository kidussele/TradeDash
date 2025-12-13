
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const firestore = admin.firestore();

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

/**
 * A callable Cloud Function that lists all users.
 * This can only be called by an authenticated user. You should add additional
 * security rules to ensure only admins can call this function.
 */
export const listUsers = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated.
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  // Optional: Check if the user is an admin.
  // You would need to set a custom claim on the user's token for this.
  // if (context.auth.token.admin !== true) {
  //   throw new functions.https.HttpsError(
  //     'permission-denied',
  //     'User must be an admin to list users.'
  //   );
  // }

  try {
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users.map((userRecord) => {
      return {
        uid: userRecord.uid,
        email: userRecord.email || "N/A",
        displayName: userRecord.displayName || "No Name",
        photoURL: userRecord.photoURL,
        disabled: userRecord.disabled,
        creationTime: new Date(
          userRecord.metadata.creationTime
        ).toLocaleDateString(),
      };
    });
    return {users};
  } catch (error) {
    functions.logger.error("Error listing users:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Unable to list users"
    );
  }
});

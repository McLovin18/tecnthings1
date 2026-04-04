
import admin from "firebase-admin";

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      // Fallback: initialize with default credentials (e.g., GOOGLE_APPLICATION_CREDENTIALS or emulator)
      admin.initializeApp();
    }
  } catch (err) {
    // If initialization fails, rethrow so callers can handle/log appropriately
    console.error("Firebase admin initialization error:", err);
    throw err;
  }
}

export const adminAuth = admin.auth();
export const db = admin.firestore();
export default admin;

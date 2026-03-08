
import admin from "firebase-admin";
// @ts-ignore
const serviceAccount = require("../../firebase-adminsdk.json");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
  });
}

export const adminAuth = admin.auth();
export default admin;

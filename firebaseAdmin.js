// server/firebaseAdmin.js
import admin from "firebase-admin";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

console.log("Render Firebase Key loaded?", !!process.env.FIREBASE_PRIVATE_KEY);
console.log("Key contains \\n?", process.env.FIREBASE_PRIVATE_KEY?.includes("\\n"));
console.log("Key starts:", process.env.FIREBASE_PRIVATE_KEY?.slice(0, 30));

admin.initializeApp({
  credential: admin.credential.cert({
    type: process.env.FIREBASE_TYPE,
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: process.env.FIREBASE_AUTH_URI,
    token_uri: process.env.FIREBASE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_CERT_URL,
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN
  })
});

export const sendPushNotification = async (token, title, body) => {
  try {
    await admin.messaging().send({
      token,
      notification: { title, body },
    });
    console.log("Push notification sent to token:", token);
  } catch (err) {
    console.error("Error sending push notification:", err);
  }
};

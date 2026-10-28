// backend/config/firebaseAdmin.js
// Firebase Admin SDK init - connects Node.js backend to Firestore + Firebase Auth

const admin = require("firebase-admin");
const path = require("path");
require("dotenv").config();

// Step 1: Firebase Console -> Project Settings -> Service Accounts -> Generate New Private Key
// Step 2: Save the downloaded JSON as backend/config/serviceAccountKey.json
const serviceAccount = require(path.join(__dirname, "serviceAccountKey.json"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

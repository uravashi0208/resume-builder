const path = require("path");
const fs = require("fs");
const admin = require("firebase-admin");
require("dotenv").config();

// Credentials, in this order:
//  1. FIREBASE_SERVICE_ACCOUNT_JSON env var (single-line JSON) — used on hosting like Render
//  2. config/serviceAccountKey.json file — easiest for local development
function loadServiceAccount() {
  const raw = (process.env.FIREBASE_SERVICE_ACCOUNT_JSON || "").trim();
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.warn(
        "FIREBASE_SERVICE_ACCOUNT_JSON in .env is not valid single-line JSON " +
        "(multi-line JSON does not work in .env) -> using config/serviceAccountKey.json instead."
      );
    }
  }
  const file = path.join(__dirname, "serviceAccountKey.json");
  if (!fs.existsSync(file)) {
    throw new Error(
      "Firebase credentials not found. Put your key in config/serviceAccountKey.json " +
      "or set FIREBASE_SERVICE_ACCOUNT_JSON to single-line JSON."
    );
  }
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(loadServiceAccount()),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };

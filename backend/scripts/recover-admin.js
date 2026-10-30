// backend/scripts/recover-admin.js
// Run:  npm run recover-admin
//   (optional)  node scripts/recover-admin.js --email you@example.com --password "MyNewPass123"
//
// Firebase never stores passwords in readable form (only hashes), so the OLD password cannot be shown.
// This script (1) console.logs every account in your Firebase Auth project, and
// (2) sets a NEW password for the admin account and console.logs it so you can log in right away.
// Admin = the --email you pass; if omitted, the oldest account (usually the first one you created).

const crypto = require("crypto");
const { auth } = require("../config/firebaseAdmin");

const arg = (name) => {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
};

(async () => {
  // 1) collect all users
  const users = [];
  let pageToken;
  do {
    const res = await auth.listUsers(1000, pageToken);
    users.push(...res.users);
    pageToken = res.pageToken;
  } while (pageToken);

  if (!users.length) {
    console.log("No users found in this Firebase project. Create one from the /register page.");
    process.exit(0);
  }

  users.sort((a, b) => new Date(a.metadata.creationTime) - new Date(b.metadata.creationTime));
  console.log("\n=== Accounts in Firebase Auth ===");
  console.table(
    users.map((u) => ({
      email: u.email,
      uid: u.uid,
      created: u.metadata.creationTime,
      lastSignIn: u.metadata.lastSignInTime,
      providers: u.providerData.map((p) => p.providerId).join(","),
    }))
  );

  // 2) pick admin + set a new password
  const wanted = arg("email");
  const admin = wanted ? users.find((u) => u.email === wanted) : users[0];
  if (!admin) {
    console.log(`No account with email "${wanted}". Pick one from the table above.`);
    process.exit(1);
  }

  const newPassword = arg("password") || crypto.randomBytes(9).toString("base64url"); // 12 chars
  await auth.updateUser(admin.uid, { password: newPassword });

  console.log("\n=== ADMIN LOGIN (new password set) ===");
  console.log("Email   :", admin.email);
  console.log("Password:", newPassword);
  console.log("Login with these on the /login page, then change the password.\n");
  process.exit(0);
})().catch((e) => {
  console.error("Failed:", e.message);
  process.exit(1);
});

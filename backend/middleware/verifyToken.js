// backend/middleware/verifyToken.js
// Angular login pachi Firebase ID token frontend mokle che, e ahiya verify thay che.

const { auth } = require("../config/firebaseAdmin");

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided. Access denied." });
  }

  const idToken = authHeader.split(" ")[1];

  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    req.user = decodedToken; // uid, email etc. available in req.user
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = verifyToken;

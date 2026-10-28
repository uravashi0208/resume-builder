// backend/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  saveProfile,
  getMyProfile,
  getProfileById,
  getAllProfiles,
  updateProfile,
  deleteProfile,
} = require("../controllers/profileController");

// All routes below are protected -> Firebase ID token required in Authorization header
router.post("/", verifyToken, saveProfile);          // Create / Upsert
router.get("/me", verifyToken, getMyProfile);          // Read own profile
router.get("/all", verifyToken, getAllProfiles);        // Read all (optional)
router.get("/:id", verifyToken, getProfileById);        // Read by id
router.patch("/", verifyToken, updateProfile);          // Update
router.delete("/", verifyToken, deleteProfile);         // Delete

module.exports = router;

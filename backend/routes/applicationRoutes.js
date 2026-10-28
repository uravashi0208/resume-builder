// backend/routes/applicationRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const {
  createApplication,
  getMyApplications,
  getApplicationById,
  updateApplication,
  deleteApplication,
} = require("../controllers/applicationController");

router.post("/", verifyToken, createApplication);
router.get("/", verifyToken, getMyApplications);
router.get("/:id", verifyToken, getApplicationById);
router.patch("/:id", verifyToken, updateApplication);
router.delete("/:id", verifyToken, deleteApplication);

module.exports = router;

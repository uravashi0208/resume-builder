// backend/controllers/applicationController.js
// Firestore collection: "applications"
// Doc fields: { uid, companyName, appliedTitle, applyDate, location, status, notes,
//               template, profile, createdAt, updatedAt }
// status: "Applied" | "Accepted" | "Rejected"
//
// `profile` = the CV snapshot (template + all customization + content) of THIS application only.
// Every application keeps its own CV, so choosing a different template for one application
// never changes another application.

const { db, admin } = require("../config/firebaseAdmin");

const COLLECTION = "applications";

// Firestore document hard limit is 1 MiB -> keep the CV snapshot safely below it
const MAX_PROFILE_BYTES = 900 * 1024;

/**
 * Validate + clean the body. Returns { error } or { data }.
 * - profile must be a plain object and small enough for Firestore
 * - fields that must never come from the client (id, uid, timestamps) are removed
 * - top-level `template` is mirrored from profile.template for quick access/filtering
 */
const sanitizeBody = (body) => {
  const data = { ...body };
  delete data.id;
  delete data.uid;
  delete data.createdAt;
  delete data.updatedAt;

  if (data.profile !== undefined) {
    const p = data.profile;
    if (p === null || typeof p !== "object" || Array.isArray(p)) {
      return { error: "profile must be an object." };
    }
    const profile = { ...p };
    delete profile.id;
    delete profile.uid;
    delete profile.updatedAt;

    if (Buffer.byteLength(JSON.stringify(profile), "utf8") > MAX_PROFILE_BYTES) {
      return { error: "CV data is too large. Please use smaller images (photo / background)." , tooLarge: true };
    }
    data.profile = profile;
    if (typeof profile.template === "string") data.template = profile.template;
  }
  return { data };
};

// CREATE
exports.createApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { data, error, tooLarge } = sanitizeBody(req.body);
    if (error) return res.status(tooLarge ? 413 : 400).json({ message: error });

    const payload = {
      ...data,
      uid,
      status: data.status || "Applied",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await db.collection(COLLECTION).add(payload);
    res.status(201).json({ id: docRef.id, message: "Application created." });
  } catch (error) {
    console.error("createApplication error:", error);
    res.status(500).json({ message: "Failed to create application.", error: error.message });
  }
};

// READ ALL (logged-in user's own applications)
exports.getMyApplications = async (req, res) => {
  try {
    const uid = req.user.uid;
    const snapshot = await db.collection(COLLECTION).where("uid", "==", uid).get();

    // The list/table does not need the heavy CV snapshot -> leave `profile` out (fetched by id when needed)
    const applications = snapshot.docs.map((doc) => {
      const { profile, ...rest } = doc.data();
      return { id: doc.id, ...rest };
    });
    // Newest first (client already has all data; sort by applyDate desc)
    applications.sort((a, b) => (b.applyDate || "").localeCompare(a.applyDate || ""));

    res.status(200).json(applications);
  } catch (error) {
    console.error("getMyApplications error:", error);
    res.status(500).json({ message: "Failed to fetch applications.", error: error.message });
  }
};

// READ ONE (for edit page)
exports.getApplicationById = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ message: "Application not found." });
    }

    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error("getApplicationById error:", error);
    res.status(500).json({ message: "Failed to fetch application.", error: error.message });
  }
};

// UPDATE
exports.updateApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ message: "Application not found." });
    }

    const { data, error, tooLarge } = sanitizeBody(req.body);
    if (error) return res.status(tooLarge ? 413 : 400).json({ message: error });

    const updates = {
      ...data, // uid is already removed -> uid change na thay
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION).doc(id).update(updates);
    res.status(200).json({ message: "Application updated successfully." });
  } catch (error) {
    console.error("updateApplication error:", error);
    res.status(500).json({ message: "Failed to update application.", error: error.message });
  }
};

// DELETE
exports.deleteApplication = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { id } = req.params;

    const doc = await db.collection(COLLECTION).doc(id).get();
    if (!doc.exists || doc.data().uid !== uid) {
      return res.status(404).json({ message: "Application not found." });
    }

    await db.collection(COLLECTION).doc(id).delete();
    res.status(200).json({ message: "Application deleted successfully." });
  } catch (error) {
    console.error("deleteApplication error:", error);
    res.status(500).json({ message: "Failed to delete application.", error: error.message });
  }
};

// backend/controllers/profileController.js
// Profile document structure (Firestore collection: "profiles", docId = user's uid)
//
// {
//   fullName: string,
//   professionalTitle: string,
//   email: string,
//   phone: string,
//   location: string,
//   aboutMe: string,
//   gdprConsent: string,   // consent text shown at bottom of every CV (editable; "" = hidden)
//   template: "template-one" | "template-two",
//   education: [{ degree, institute, duration, score }],
//   coreCompetencies: [string],
//   technicalSkills: [{ category, items: [string] }],
//   interests: [string],
//   experience: [{ role, company, location, duration, description }],
//   socialLinks: { linkedin, github, portfolio, twitter },
//   updatedAt: timestamp
// }

const { db, admin } = require("../config/firebaseAdmin");

const COLLECTION = "profiles";

// Default GDPR consent text — used for profiles that were saved before this field existed.
// (Same text lives in the frontend: DEFAULT_GDPR_CONSENT). An explicit "" is respected = hidden.
const DEFAULT_GDPR_CONSENT =
  "I hereby consent to the processing of my personal data for recruitment purposes in accordance with Regulation (EU) 2016/679 (GDPR).";
const GDPR_MAX_LENGTH = 2000;

const withDefaults = (id, data) => ({
  id,
  ...data,
  gdprConsent: typeof data.gdprConsent === "string" ? data.gdprConsent : DEFAULT_GDPR_CONSENT,
});

// CREATE / UPDATE (upsert) - one profile per logged-in user
exports.saveProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const data = req.body;

    if (data.gdprConsent !== undefined) {
      if (typeof data.gdprConsent !== "string") {
        return res.status(400).json({ message: "gdprConsent must be a string." });
      }
      data.gdprConsent = data.gdprConsent.trim().slice(0, GDPR_MAX_LENGTH);
    }

    const payload = {
      ...data,
      uid,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION).doc(uid).set(payload, { merge: true });

    res.status(200).json({ message: "Profile saved successfully.", uid });
  } catch (error) {
    console.error("saveProfile error:", error);
    res.status(500).json({ message: "Failed to save profile.", error: error.message });
  }
};

// READ - get logged-in user's own profile
exports.getMyProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    const doc = await db.collection(COLLECTION).doc(uid).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json(withDefaults(doc.id, doc.data()));
  } catch (error) {
    console.error("getMyProfile error:", error);
    res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

// READ - get any profile by id (e.g. public portfolio view)
exports.getProfileById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await db.collection(COLLECTION).doc(id).get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Profile not found." });
    }

    res.status(200).json(withDefaults(doc.id, doc.data()));
  } catch (error) {
    console.error("getProfileById error:", error);
    res.status(500).json({ message: "Failed to fetch profile.", error: error.message });
  }
};

// READ ALL (optional - e.g. admin/listing view)
exports.getAllProfiles = async (req, res) => {
  try {
    const snapshot = await db.collection(COLLECTION).get();
    const profiles = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(profiles);
  } catch (error) {
    console.error("getAllProfiles error:", error);
    res.status(500).json({ message: "Failed to fetch profiles.", error: error.message });
  }
};

// UPDATE - partial update (PATCH)
exports.updateProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    if (req.body.gdprConsent !== undefined) {
      if (typeof req.body.gdprConsent !== "string") {
        return res.status(400).json({ message: "gdprConsent must be a string." });
      }
      req.body.gdprConsent = req.body.gdprConsent.trim().slice(0, GDPR_MAX_LENGTH);
    }
    const updates = {
      ...req.body,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION).doc(uid).update(updates);
    res.status(200).json({ message: "Profile updated successfully." });
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
};

// DELETE
exports.deleteProfile = async (req, res) => {
  try {
    const uid = req.user.uid;
    await db.collection(COLLECTION).doc(uid).delete();
    res.status(200).json({ message: "Profile deleted successfully." });
  } catch (error) {
    console.error("deleteProfile error:", error);
    res.status(500).json({ message: "Failed to delete profile.", error: error.message });
  }
};
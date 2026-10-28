// backend/server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const profileRoutes = require("./routes/profileRoutes");
const applicationRoutes = require("./routes/applicationRoutes");

const app = express();

app.use(cors());
// CV snapshot (photo / background images as base64) is sent with every application.
// Firestore docs are capped at ~1 MiB, applicationController rejects anything bigger with a clear message.
app.use(express.json({ limit: "3mb" }));

app.get("/", (req, res) => {
  res.send("Resume Builder API is running ✅");
});

app.use("/api/profiles", profileRoutes);
app.use("/api/applications", applicationRoutes);

// body bigger than the limit -> friendly JSON instead of an HTML error page
app.use((err, req, res, next) => {
  if (err && err.type === "entity.too.large") {
    return res.status(413).json({ message: "Data is too large. Please use smaller images." });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

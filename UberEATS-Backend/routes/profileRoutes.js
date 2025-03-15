const express = require("express");
const CustomerProfile = require("../models/CustomerProfile");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

// Middleware to ensure authentication
const authMiddleware = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: Please log in!" });
  }
  next();
};

// Get Customer Profile
router.get("/", authMiddleware, async (req, res) => {
  try {
    const profile = await CustomerProfile.getProfile(req.session.user.id);
    if (!profile) {
      return res.status(404).json({ error: "Profile not found!" });
    }
    res.json(profile);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// Update Customer Profile
router.put("/", authMiddleware, async (req, res) => {
  try {
    const { phone, address, country, state, city } = req.body;
    await CustomerProfile.updateProfile(
      req.session.user.id,
      phone,
      address,
      country,
      state,
      city
    );
    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Ensure uploads folder exists
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Set up storage for profile pictures
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    cb(null, `profile_${req.session.user.id}_${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Upload Profile Picture
router.post("/upload", authMiddleware, upload.single("profile_picture"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded!" });
    }

    const profile_picture = `/uploads/${req.file.filename}`;
    await CustomerProfile.updateProfilePicture(req.session.user.id, profile_picture);

    res.json({ message: "Profile picture uploaded successfully!", profile_picture });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

module.exports = router;

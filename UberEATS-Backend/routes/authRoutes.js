const express = require("express");
const bcrypt = require("bcryptjs");
const rateLimit = require("express-rate-limit"); // ✅ Moved to the top
const db = require("../config/db"); 
const User = require("../models/User");
const CustomerProfile = require("../models/CustomerProfile");
const Restaurant = require("../models/Restaurant");

const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();
const bcryptSaltRounds = 12; // ✅ Defined once, globally




// ✅ Define rate limiter only ONCE at the top
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: { message: "Too many login attempts. Try again later." },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// ✅ Function to Validate Password Strength
const isPasswordStrong = (password) => {
  const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return strongPasswordRegex.test(password);
};


// ✅ User Signup (Register)
router.post("/signup", async (req, res) => {
  try {
      const { name, email, password, role } = req.body;

      // ✅ Validate required fields
      if (!name || !email || !password || !role) {
          return res.status(400).json({ message: "All fields are required!" });
      }

      // ✅ Check for strong password
      if (!isPasswordStrong(password)) {
          return res.status(400).json({ message: "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character." });
      }

      // ✅ Check if the user already exists
      const existingUser = await db.execute("SELECT email FROM users WHERE email = ?", [email]);
      if (existingUser[0].length > 0) {
          return res.status(400).json({ message: "Email already registered!" });
      }

      // ✅ Hash password before saving
      const hashedPassword = await bcrypt.hash(password, 10);

      // ✅ Insert user into the database
      await db.execute(
          "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
          [name, email, hashedPassword, role]
      );

      res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
      console.error("Error in signup:", error);
      res.status(500).json({ error: "Server error!" });
  }
});




// ✅ User Login
router.post("/login", async (req, res) => {
  try {
      const { email, password } = req.body;
      console.log(`🔹 Login attempt: ${email}`);

      // Validate input
      if (!email || !password) {
          console.log("❌ Missing email or password");
          return res.status(400).json({ message: "Email and password are required!" });
      }

      // Debugging: Log the exact query being executed
      console.log(`🔹 Executing SQL Query: SELECT * FROM admins WHERE email = '${email}'`);

      // Find user
      const [user] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);
      console.log("🔹 Retrieved User:", JSON.stringify(user, null, 2));

      if (user.length === 0) {
          console.log("❌ User not found in database!");
          return res.status(400).json({ message: "Invalid email or password!" });
      }

      // Compare passwords
      console.log(`🔹 Comparing entered password with stored hash...`);
      console.log(`🔹 Entered password: ${password}`);
      console.log(`🔹 Stored Hash: ${user[0].password}`);

      const isMatch = await bcrypt.compare(password, user[0].password);
      
      if (!isMatch) {
          console.log("❌ Password mismatch!");
          return res.status(400).json({ message: "Invalid email or password!" });
      }

      // Generate JWT Token
      const token = jwt.sign(
          { id: user[0].id, email: user[0].email, role: user[0].role },
          process.env.JWT_SECRET || "supersecretkey",
          { expiresIn: "1h" }
      );

      console.log("✅ Login successful!");
      res.json({ message: "Login successful!", token });

  } catch (error) {
      console.error("🚨 Error in login:", error);
      res.status(500).json({ error: "Server error!" });
  }
});



// ✅ Admin Login with Rate Limiting
router.post("/admin-login", loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required!" });
    }

    // Find admin by email
    const [adminRows] = await db.execute("SELECT * FROM admins WHERE email = ?", [email]);

    if (adminRows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const admin = adminRows[0];

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Store admin session
    req.session.admin = { id: admin.id, email: admin.email, role: admin.role };

    res.json({ message: "Login successful!", admin: req.session.admin });
  } catch (error) {
    console.error("Error in admin login:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Admin Logout
router.post("/admin-logout", (req, res) => {
  if (req.session.admin) {
    console.log(`Admin ${req.session.admin.email} logged out.`);
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out!" });
      }
      res.json({ message: "Admin logged out successfully!" });
    });
  } else {
    res.status(400).json({ error: "No active admin session!" });
  }
});

// ✅ User Logout
let blacklistedTokens = new Set(); // Store invalidated tokens in memory

router.post("/logout", (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided!" });
    }

    const token = authHeader.split(" ")[1];

    // Add token to blacklist
    blacklistedTokens.add(token);
    console.log(`🔹 Token blacklisted: ${token}`);

    res.json({ message: "Logout successful! Token invalidated." });
});

module.exports = { router, blacklistedTokens };

module.exports = router;

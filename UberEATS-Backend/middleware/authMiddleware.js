const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

// ✅ In-memory store for blacklisted tokens
const blacklistedTokens = new Set();

/**
 * ✅ Middleware to verify JWT Token and check if it's blacklisted
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log("🔹 Received Authorization Header:", authHeader);

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            console.log("❌ No valid token provided!");
            return res.status(401).json({ error: "Unauthorized: No token provided!" });
        }

        const token = authHeader.split(" ")[1].trim();
        console.log("🔹 Extracted Token:", token);

        // ✅ Debug: Print the current blacklisted tokens
        console.log("🛑 Current Blacklisted Tokens:", Array.from(blacklistedTokens));

        // ✅ Ensure the token is blacklisted before proceeding
        if (blacklistedTokens.has(token)) {
            console.log("❌ Attempt to use a blacklisted token.");
            return res.status(403).json({ error: "Forbidden: Token is invalid or expired!" });
        }

        // ✅ Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
        } catch (error) {
            console.error("❌ Token Verification Failed:", error.message);
            return res.status(403).json({ error: "Forbidden: Invalid or expired token!" });
        }

        console.log("✅ Token Decoded Successfully:", decoded);

        // ✅ Attach user details to request
        req.user = decoded;
        next();
    } catch (error) {
        console.error("❌ Unexpected Error in Token Verification:", error.message);
        return res.status(500).json({ error: "Server error!" });
    }
};

/**
 * ✅ Middleware to restrict access to Super Admin only
 */
const requireSuperAdmin = (req, res, next) => {
    console.log("🔹 Checking Super Admin Access...");

    if (!req.user || req.user.role !== "super_admin") {
        console.log("❌ Unauthorized Role Attempt:", req.user ? req.user.role : "Unknown");
        return res.status(403).json({ error: "Forbidden: Only super admins can perform this action!" });
    }

    console.log("✅ Access Granted: Super Admin");
    next();
};

/**
 * ✅ Logout route - Blacklist token
 */
const logout = (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ error: "Unauthorized: No token provided!" });
        }

        const token = authHeader.split(" ")[1];

        // ✅ Add token to blacklist
        blacklistedTokens.add(token);
        console.log(`🔹 Token blacklisted: ${token}`);

        res.json({ message: "Logout successful! Token invalidated." });
    } catch (error) {
        console.error("❌ Logout Failed:", error.message);
        res.status(500).json({ error: "Server error!" });
    }
};

// ✅ Function to check if a token is blacklisted (for debugging)
const isTokenBlacklisted = (token) => blacklistedTokens.has(token);

module.exports = {
    verifyToken,
    requireSuperAdmin,
    logout,
    isTokenBlacklisted
};

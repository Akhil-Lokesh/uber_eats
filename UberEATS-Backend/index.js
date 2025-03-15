const express = require("express");
const session = require("express-session");
const cors = require("cors");
const dotenv = require("dotenv");
const db = require("./config/db");
require("dotenv").config();


dotenv.config();

const app = express();

// ✅ Fix: Allow frontend & Postman to send cookies
app.use(
  cors({
    origin: "http://localhost:3000", // Adjust if frontend runs on a different port
    credentials: true, // ✅ This allows cookies to be sent with requests
  })
);

// ✅ Fix: Ensure session is initialized correctly
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Enable secure cookies in production
      httpOnly: true, // Prevents client-side JS from accessing cookies
      sameSite: "strict", // Protects against CSRF attacks
      maxAge: 24 * 60 * 60 * 1000, // 1-day session expiration
    },
  })
);


// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Default Route
app.get("/", (req, res) => {
  res.send("UberEATS Backend is Running!");
});

// ✅ Import Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ✅ Use Routes (Ensure correct endpoints)
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/restaurants", restaurantRoutes); // ✅ Fix: Changed `/api/restaurant` to `/api/restaurants`
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

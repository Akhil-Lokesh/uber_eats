const express = require("express");
const db = require("../config/db");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verifyToken, requireSuperAdmin, logout, blacklistedTokens } = require("../middleware/authMiddleware");

// ✅ Function to log admin actions
const logAdminAction = async (admin_email, action, target_user_id = null) => {
  try {
    await db.execute(
      "INSERT INTO admin_logs (admin_email, action, target_user_id) VALUES (?, ?, ?)", 
      [admin_email, action, target_user_id]
    );
  } catch (error) {
    console.error("❌ Error logging admin action:", error);
  }
};

// ✅ Admin Dashboard (JWT Protected)
router.get("/dashboard", verifyToken, async (req, res) => {
  try {
    // ✅ Ensure token is not blacklisted
    const token = req.headers.authorization.split(" ")[1];
    if (blacklistedTokens.has(token)) {
      console.log("❌ Attempt to access dashboard with blacklisted token.");
      return res.status(403).json({ error: "Forbidden: Token is invalid or expired!" });
    }

    console.log(`✅ Admin ${req.user.email} is fetching dashboard stats`);

    const [totalOrders] = await db.execute("SELECT COUNT(*) AS total_orders FROM orders");
    const [totalRevenue] = await db.execute("SELECT IFNULL(SUM(total_price), 0) AS total_revenue FROM orders");

    const [topRestaurants] = await db.execute(`
      SELECT r.name AS restaurant_name, COUNT(o.id) AS order_count
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      GROUP BY r.id
      ORDER BY order_count DESC
      LIMIT 5
    `);

    res.json({
      total_orders: totalOrders[0].total_orders,
      total_revenue: totalRevenue[0].total_revenue,
      top_restaurants: topRestaurants,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Server error!" });
  }
});


// ✅ Logout (Blacklist Token)
router.post("/logout", verifyToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    blacklistedTokens.add(token); // ✅ Blacklist the token
    console.log(`🔹 Token blacklisted: ${token}`);

    res.json({ message: "Logout successful! Token invalidated." });
  } catch (error) {
    console.error("❌ Error in logout:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Update Order Status (Super Admin Only)
router.put("/orders/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order_id = req.params.id;

    console.log(`🔹 Super Admin ${req.user.email} updating order_id=${order_id} to status=${status}`);

    if (!["Pending", "Preparing", "Delivered", "Cancelled"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value!" });
    }

    const checkQuery = "SELECT * FROM orders WHERE id = ?";
    const [order] = await db.execute(checkQuery, [order_id]);

    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found!" });
    }

    await db.execute("UPDATE orders SET status = ? WHERE id = ?", [status, order_id]);

    await logAdminAction(req.user.email, `Updated Order Status to ${status}`, order_id);
    res.json({ message: `Order updated to ${status} successfully!` });
  } catch (error) {
    console.error("❌ Error updating order status:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Delete Order (Super Admin Only)
router.delete("/orders/:id", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const order_id = req.params.id;
    console.log(`🛑 Super Admin ${req.user.email} is attempting to delete order_id=${order_id}`);

    const checkQuery = "SELECT id FROM orders WHERE id = ?";
    const [order] = await db.execute(checkQuery, [order_id]);

    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found!" });
    }

    await db.execute("DELETE FROM orders WHERE id = ?", [order_id]);
    console.log(`✅ Order ID ${order_id} deleted successfully!`);
    res.json({ message: `Order ID ${order_id} deleted successfully!` });
  } catch (error) {
    console.error("❌ Error deleting order:", error);
    res.status(500).json({ error: "Server error! Please try again later." });
  }
});

// ✅ Fetch Admin Profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    let targetEmail = req.user.email;

    if (req.user.role === "super_admin" && req.query.email) {
      console.log(`🔹 Super Admin fetching profile for: ${req.query.email}`);
      targetEmail = req.query.email;
    } else if (req.query.email && req.query.email !== req.user.email) {
      return res.status(403).json({ error: "Forbidden: Admins cannot fetch another admin's profile!" });
    }

    const [admin] = await db.execute("SELECT id, email, role FROM admins WHERE email = ?", [targetEmail]);

    if (admin.length === 0) {
      return res.status(404).json({ error: "Admin profile not found!" });
    }

    res.json(admin[0]);
  } catch (error) {
    console.error("❌ Error fetching admin profile:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get Admin Logs (Super Admin Only)
router.get("/logs", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    console.log(`Super Admin ${req.user.email} is viewing logs`);

    const query = `
      SELECT id, admin_email, action, target_user_id, timestamp 
      FROM admin_logs 
      ORDER BY timestamp DESC
      LIMIT 50
    `;

    const [logs] = await db.execute(query);

    if (logs.length === 0) {
      console.log(`❌ No logs found in the database.`);
      return res.status(404).json({ error: "No logs found!" });
    }

    res.json(logs);
  } catch (error) {
    console.error("❌ Error fetching logs:", error);
    res.status(500).json({ error: "Server error!" });
  }
});


// ✅ Create a New User (Super Admin Only)
router.post("/users", verifyToken, requireSuperAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(`Super Admin ${req.user.email} is creating a new user: ${email}`);

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const checkQuery = "SELECT id FROM users WHERE email = ?";
    const [existingUser] = await db.execute(checkQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({ error: "Email already registered!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.execute("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, role]);

    res.status(201).json({ message: "User created successfully!" });
  } catch (error) {
    console.error("❌ Error creating user:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

module.exports = router;

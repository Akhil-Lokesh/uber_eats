const express = require("express");
const Order = require("../models/Order");
const db = require("../config/db");
const Dish = require("../models/Dish");
const router = express.Router();

// Middleware to ensure authentication for customers
const customerAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: "Unauthorized: Please log in!" });
  }
  next();
};

// Middleware to ensure authentication for restaurants
const restaurantAuth = (req, res, next) => {
  if (!req.session.restaurant) {
    return res.status(401).json({ error: "Unauthorized: Please log in!" });
  }
  next();
};

// ✅ Place a new order
router.post("/", customerAuth, async (req, res) => {
  try {
    const { dish_id, quantity } = req.body;
    const customer_id = req.session.user.id;

    console.log(`Placing order: customer_id=${customer_id}, dish_id=${dish_id}, quantity=${quantity}`);

    // Get dish details
    const dishQuery = "SELECT price, restaurant_id FROM dishes WHERE id = ?";
    const [dishRows] = await db.execute(dishQuery, [dish_id]);

    if (dishRows.length === 0) {
      return res.status(404).json({ error: "Dish not found!" });
    }

    const { price, restaurant_id } = dishRows[0];
    const total_price = price * quantity;

    await Order.create(customer_id, restaurant_id, dish_id, quantity, total_price);

    res.status(201).json({ message: "Order placed successfully!" });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get all orders for a customer
router.get("/", customerAuth, async (req, res) => {
  try {
    const customer_id = req.session.user.id;
    console.log(`Fetching orders for customer_id=${customer_id}`);
    
    const orders = await Order.getByCustomer(customer_id);
    
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get order details by order ID (Only customer can track)
router.get("/:id", customerAuth, async (req, res) => {
  try {
    const order_id = req.params.id;
    const customer_id = req.session.user.id;

    console.log(`Fetching details for order_id=${order_id} by customer_id=${customer_id}`);

    const query = `
      SELECT o.id, o.status, o.total_price, d.name AS dish_name, r.name AS restaurant_name
      FROM orders o
      JOIN dishes d ON o.dish_id = d.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.id = ? AND o.customer_id = ?
    `;
    
    const [order] = await db.execute(query, [order_id, customer_id]);

    if (order.length === 0) {
      return res.status(404).json({ error: "Order not found or does not belong to you!" });
    }

    res.json(order[0]);
  } catch (error) {
    console.error("Error fetching order details:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Submit Feedback for an Order
router.post("/:id/feedback", customerAuth, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const order_id = req.params.id;
    const customer_id = req.session.user.id;

    console.log(`Customer ${customer_id} submitting feedback for order ${order_id}`);

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5!" });
    }

    // Ensure the order is completed before allowing feedback
    const checkQuery = "SELECT * FROM orders WHERE id = ? AND customer_id = ? AND status = 'Delivered'";
    const [order] = await db.execute(checkQuery, [order_id, customer_id]);

    if (order.length === 0) {
      return res.status(400).json({ error: "You can only review completed orders!" });
    }

    // Insert feedback into the database
    const insertQuery = "INSERT INTO feedbacks (order_id, customer_id, rating, comment) VALUES (?, ?, ?, ?)";
    await db.execute(insertQuery, [order_id, customer_id, rating, comment]);

    res.status(201).json({ message: "Feedback submitted successfully!" });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get Feedback for an Order
router.get("/:id/feedback", async (req, res) => {
  try {
    const order_id = req.params.id;

    console.log(`Fetching feedback for order ${order_id}`);

    const query = `
      SELECT f.rating, f.comment, f.created_at, u.name AS customer_name
      FROM feedbacks f
      JOIN users u ON f.customer_id = u.id
      WHERE f.order_id = ?
    `;

    const [feedback] = await db.execute(query, [order_id]);

    if (feedback.length === 0) {
      return res.status(404).json({ error: "No feedback found for this order!" });
    }

    res.json(feedback);
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

module.exports = router;

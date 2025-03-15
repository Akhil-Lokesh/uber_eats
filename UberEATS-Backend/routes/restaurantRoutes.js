const express = require("express");
const db = require("../config/db");
const Dish = require("../models/Dish");

const router = express.Router();

// Middleware to ensure authentication for restaurants
const authMiddleware = (req, res, next) => {
  if (!req.session.restaurant) {
    return res.status(401).json({ error: "Unauthorized: Please log in!" });
  }
  next();
};

// ✅ GET Restaurant Profile
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const restaurantId = req.session.restaurant.id;
    const query = "SELECT id, name, email, location, phone, cuisine, created_at FROM restaurants WHERE id = ?";
    const [rows] = await db.execute(query, [restaurantId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: "Restaurant not found!" });
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching restaurant profile:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Update Restaurant Profile
router.put("/profile", authMiddleware, async (req, res) => {
  try {
    const { name, location, phone, cuisine } = req.body;
    const restaurantId = req.session.restaurant.id;

    if (!name || !location || !phone || !cuisine) {
      return res.status(400).json({ error: "All fields are required!" });
    }

    const query = "UPDATE restaurants SET name=?, location=?, phone=?, cuisine=? WHERE id=?";
    const [result] = await db.execute(query, [name, location, phone, cuisine, restaurantId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Restaurant not found!" });
    }

    res.json({ message: "Profile updated successfully!" });
  } catch (error) {
    console.error("Error updating restaurant profile:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Add a new dish
router.post("/dishes", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const restaurant_id = req.session.restaurant.id;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: "All fields except image are required!" });
    }

    await Dish.create(restaurant_id, name, description, price, category, image);

    res.status(201).json({ message: "Dish added successfully!" });
  } catch (error) {
    console.error("Error adding dish:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get all dishes for a restaurant
router.get("/dishes", authMiddleware, async (req, res) => {
  try {
    const restaurant_id = req.session.restaurant.id;
    console.log(`Fetching dishes for restaurant_id=${restaurant_id}`);

    const dishes = await Dish.getByRestaurant(restaurant_id);
    res.json(dishes);
  } catch (error) {
    console.error("Error fetching dishes:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Update a dish
router.put("/dishes/:id", authMiddleware, async (req, res) => {
  try {
    const { name, description, price, category, image } = req.body;
    const dish_id = req.params.id;

    if (!name || !description || !price || !category) {
      return res.status(400).json({ error: "All fields except image are required!" });
    }

    await Dish.update(dish_id, name, description, price, category, image);
    res.json({ message: "Dish updated successfully!" });
  } catch (error) {
    console.error("Error updating dish:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Delete a dish
router.delete("/dishes/:id", authMiddleware, async (req, res) => {
  try {
    const dish_id = req.params.id;
    await Dish.delete(dish_id);
    res.json({ message: "Dish deleted successfully!" });
  } catch (error) {
    console.error("Error deleting dish:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

// ✅ Get Restaurant Ratings
router.get("/:id/rating", async (req, res) => {
  try {
    const restaurant_id = req.params.id;

    console.log(`Fetching ratings for restaurant_id=${restaurant_id}`);

    const query = `
      SELECT 
        IFNULL(AVG(rating), 0) AS average_rating, 
        COUNT(*) AS total_reviews
      FROM feedbacks
      WHERE restaurant_id = ?
    `;

    const [ratings] = await db.execute(query, [restaurant_id]);

    res.json({
      restaurant_id,
      average_rating: parseFloat(ratings[0].average_rating).toFixed(2),
      total_reviews: ratings[0].total_reviews
    });
  } catch (error) {
    console.error("Error fetching restaurant ratings:", error);
    res.status(500).json({ error: "Server error!" });
  }
});

module.exports = router;

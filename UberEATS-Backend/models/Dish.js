const db = require("../config/db");

class Dish {
  // Create a new dish
  static async create(restaurant_id, name, description, price, category, image) {
    const query =
      "INSERT INTO dishes (restaurant_id, name, description, price, category, image) VALUES (?, ?, ?, ?, ?, ?)";
    const [result] = await db.execute(query, [restaurant_id, name, description, price, category, image]);
    return result;
  }

  // Get dishes for a restaurant
  static async getByRestaurant(restaurant_id) {
    const query = "SELECT * FROM dishes WHERE restaurant_id = ?";
    const [rows] = await db.execute(query, [restaurant_id]);
    return rows;
  }

  // Update a dish
  static async update(dish_id, name, description, price, category, image) {
    const query =
      "UPDATE dishes SET name=?, description=?, price=?, category=?, image=? WHERE id=?";
    const [result] = await db.execute(query, [name, description, price, category, image, dish_id]);
    return result;
  }

  // Delete a dish
  static async delete(dish_id) {
    const query = "DELETE FROM dishes WHERE id=?";
    const [result] = await db.execute(query, [dish_id]);
    return result;
  }
}

module.exports = Dish;

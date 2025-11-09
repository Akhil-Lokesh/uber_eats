const db = require("../config/db");

class Dish {
  // Create a new dish
  static async create(restaurant_id, name, description, price, category, image) {
    const query =
      "INSERT INTO dishes (restaurant_id, name, description, price, category, image) VALUES ($1, $2, $3, $4, $5, $6)";
    const result = await db.query(query, [restaurant_id, name, description, price, category, image]);
    return result;
  }

  // Get dishes for a restaurant
  static async getByRestaurant(restaurant_id) {
    const query = "SELECT * FROM dishes WHERE restaurant_id = $1";
    const result = await db.query(query, [restaurant_id]);
    return result.rows;
  }

  // Update a dish
  static async update(dish_id, name, description, price, category, image) {
    const query =
      "UPDATE dishes SET name=$1, description=$2, price=$3, category=$4, image=$5 WHERE id=$6";
    const result = await db.query(query, [name, description, price, category, image, dish_id]);
    return result;
  }

  // Delete a dish
  static async delete(dish_id) {
    const query = "DELETE FROM dishes WHERE id=$1";
    const result = await db.query(query, [dish_id]);
    return result;
  }
}

module.exports = Dish;

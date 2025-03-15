const db = require("../config/db");

class Order {
  // Create a new order
  static async create(customer_id, restaurant_id, dish_id, quantity, total_price) {
    const query =
      "INSERT INTO orders (customer_id, restaurant_id, dish_id, quantity, total_price) VALUES (?, ?, ?, ?, ?)";
    const [result] = await db.execute(query, [customer_id, restaurant_id, dish_id, quantity, total_price]);
    return result;
  }

  // Get orders for a customer
  static async getByCustomer(customer_id) {
    const query = `
      SELECT o.id, o.status, o.total_price, d.name AS dish_name, r.name AS restaurant_name 
      FROM orders o
      JOIN dishes d ON o.dish_id = d.id
      JOIN restaurants r ON o.restaurant_id = r.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC`;
    const [rows] = await db.execute(query, [customer_id]);
    return rows;
  }

  // Get orders for a restaurant
  static async getByRestaurant(restaurant_id) {
    const query = `
      SELECT o.id, o.status, o.total_price, d.name AS dish_name, u.name AS customer_name
      FROM orders o
      JOIN dishes d ON o.dish_id = d.id
      JOIN users u ON o.customer_id = u.id
      WHERE o.restaurant_id = ?
      ORDER BY o.created_at DESC`;
    const [rows] = await db.execute(query, [restaurant_id]);
    return rows;
  }
}

module.exports = Order;

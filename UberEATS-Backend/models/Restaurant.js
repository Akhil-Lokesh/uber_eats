const db = require("../config/db");

class Restaurant {
  // Create a new restaurant
  static async create(name, email, password, location, phone, cuisine) {
    const query =
      "INSERT INTO restaurants (name, email, password, location, phone, cuisine) VALUES ($1, $2, $3, $4, $5, $6)";
    const result = await db.query(query, [name, email, password, location, phone, cuisine]);
    return result;
  }

  // Find restaurant by email
  static async findByEmail(email) {
    const query = "SELECT * FROM restaurants WHERE email = $1";
    const result = await db.query(query, [email]);
    const rows = result.rows;
    return rows.length > 0 ? rows[0] : null; // Return restaurant if found
  }
}

module.exports = Restaurant;

const db = require("../config/db");

class User {
  // Create a new user
  static async create(name, email, password, role) {
    const query = "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)";
    const result = await db.query(query, [name, email, password, role]);
    return result;
  }

  // Find user by email
  static async findByEmail(email) {
    if (!email) {
      throw new Error("Email is required but received undefined!");
    }

    const query = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(query, [email]);
    const rows = result.rows;

    return rows.length > 0 ? rows[0] : null; // Return user if found, otherwise null
  }
}

module.exports = User;

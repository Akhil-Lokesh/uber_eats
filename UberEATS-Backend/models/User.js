const db = require("../config/db");

class User {
  // Create a new user
  static async create(name, email, password, role) {
    const query = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
    const [result] = await db.execute(query, [name, email, password, role]);
    return result;
  }

  // Find user by email
  static async findByEmail(email) {
    if (!email) {
      throw new Error("Email is required but received undefined!");
    }
    
    const query = "SELECT * FROM users WHERE email = ?";
    const [rows] = await db.execute(query, [email]);

    return rows.length > 0 ? rows[0] : null; // Return user if found, otherwise null
  }
}

module.exports = User;

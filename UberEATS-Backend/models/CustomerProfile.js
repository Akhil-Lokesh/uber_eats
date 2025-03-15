const db = require("../config/db");

class CustomerProfile {
  // Create a new customer profile
  static async createProfile(user_id) {
    try {
      const query = "INSERT INTO customer_profiles (user_id) VALUES (?)";
      await db.execute(query, [user_id]);
    } catch (error) {
      console.error("Error creating profile:", error);
      throw error;
    }
  }

  // Get customer profile by user_id
  static async getProfile(user_id) {
    try {
      const query = "SELECT * FROM customer_profiles WHERE user_id = ?";
      const [rows] = await db.execute(query, [user_id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error("Error fetching profile:", error);
      throw error;
    }
  }

  // Update customer profile
  static async updateProfile(user_id, phone, address, country, state, city) {
    try {
      const query =
        "UPDATE customer_profiles SET phone=?, address=?, country=?, state=?, city=? WHERE user_id=?";
      const [result] = await db.execute(query, [phone, address, country, state, city, user_id]);

      return result.affectedRows > 0; // Returns true if update was successful
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  // Update profile picture
  static async updateProfilePicture(user_id, profile_picture) {
    try {
      const query =
        "UPDATE customer_profiles SET profile_picture=? WHERE user_id=?";
      const [result] = await db.execute(query, [profile_picture, user_id]);

      return result.affectedRows > 0; // Returns true if update was successful
    } catch (error) {
      console.error("Error updating profile picture:", error);
      throw error;
    }
  }
}

module.exports = CustomerProfile;

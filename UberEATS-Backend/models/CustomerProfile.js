const db = require("../config/db");
const logger = require("../utils/logger");

class CustomerProfile {
  // Create a new customer profile
  static async createProfile(user_id) {
    try {
      const query = "INSERT INTO customer_profiles (user_id) VALUES ($1)";
      await db.query(query, [user_id]);
    } catch (error) {
      logger.error("Error creating customer profile", {
        error: error.message,
        stack: error.stack,
        user_id
      });
      throw error;
    }
  }

  // Get customer profile by user_id
  static async getProfile(user_id) {
    try {
      const query = "SELECT * FROM customer_profiles WHERE user_id = $1";
      const result = await db.query(query, [user_id]);
      const rows = result.rows;
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      logger.error("Error fetching customer profile", {
        error: error.message,
        stack: error.stack,
        user_id
      });
      throw error;
    }
  }

  // Update customer profile
  static async updateProfile(user_id, phone, address, country, state, city) {
    try {
      const query =
        "UPDATE customer_profiles SET phone=$1, address=$2, country=$3, state=$4, city=$5 WHERE user_id=$6";
      const result = await db.query(query, [phone, address, country, state, city, user_id]);

      return result.rowCount > 0; // Returns true if update was successful
    } catch (error) {
      logger.error("Error updating customer profile", {
        error: error.message,
        stack: error.stack,
        user_id
      });
      throw error;
    }
  }

  // Update profile picture
  static async updateProfilePicture(user_id, profile_picture) {
    try {
      const query =
        "UPDATE customer_profiles SET profile_picture=$1 WHERE user_id=$2";
      const result = await db.query(query, [profile_picture, user_id]);

      return result.rowCount > 0; // Returns true if update was successful
    } catch (error) {
      logger.error("Error updating profile picture", {
        error: error.message,
        stack: error.stack,
        user_id,
        profile_picture
      });
      throw error;
    }
  }
}

module.exports = CustomerProfile;

/**
 * Order Model - Enhanced with multi-item support
 */

const db = require('../config/db');

class Order {
  /**
   * Create a new order with multiple items
   * @param {Object} orderData - { customer_id, restaurant_id, total_price, delivery_address, items: [{dish_id, quantity, price}] }
   */
  static async create(orderData) {
    const { customer_id, restaurant_id, total_price, delivery_address, delivery_phone, notes, items } = orderData;

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Insert main order
      const [orderResult] = await connection.execute(
        `INSERT INTO orders (customer_id, restaurant_id, total_price, delivery_address, delivery_phone, notes, status)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending')`,
        [customer_id, restaurant_id, total_price, delivery_address, delivery_phone || null, notes || null]
      );

      const orderId = orderResult.insertId;

      // Insert order items
      for (const item of items) {
        const subtotal = item.price * item.quantity;
        await connection.execute(
          `INSERT INTO order_items (order_id, dish_id, quantity, price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [orderId, item.dishId, item.quantity, item.price, subtotal]
        );
      }

      await connection.commit();
      return { orderId, insertId: orderId };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Get orders for a customer with items
   */
  static async getByCustomer(customer_id) {
    const query = `
      SELECT 
        o.id, o.status, o.total_price, o.delivery_address, o.created_at,
        o.estimated_delivery_time,
        r.name AS restaurant_name, r.cuisine, r.location AS restaurant_location,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'dish_id', oi.dish_id,
            'dish_name', d.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) AS items
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN dishes d ON oi.dish_id = d.id
      WHERE o.customer_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [customer_id]);
    
    // Parse JSON items
    return rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
  }

  /**
   * Get single order with details
   */
  static async getById(order_id, customer_id = null) {
    let query = `
      SELECT 
        o.id, o.customer_id, o.restaurant_id, o.status, o.total_price, 
        o.delivery_address, o.delivery_phone, o.notes, o.created_at,
        o.estimated_delivery_time, o.delivered_at,
        u.name AS customer_name, u.email AS customer_email,
        r.name AS restaurant_name, r.cuisine, r.phone AS restaurant_phone,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'dish_id', oi.dish_id,
            'dish_name', d.name,
            'quantity', oi.quantity,
            'price', oi.price,
            'subtotal', oi.subtotal
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN restaurants r ON o.restaurant_id = r.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN dishes d ON oi.dish_id = d.id
      WHERE o.id = ?
    `;

    const params = [order_id];

    if (customer_id) {
      query += ' AND o.customer_id = ?';
      params.push(customer_id);
    }

    query += ' GROUP BY o.id';

    const [rows] = await db.execute(query, params);
    
    if (rows.length === 0) return null;

    return {
      ...rows[0],
      items: JSON.parse(rows[0].items)
    };
  }

  /**
   * Get orders for a restaurant
   */
  static async getByRestaurant(restaurant_id) {
    const query = `
      SELECT 
        o.id, o.status, o.total_price, o.delivery_address, o.created_at,
        u.name AS customer_name, u.email AS customer_email,
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'dish_id', oi.dish_id,
            'dish_name', d.name,
            'quantity', oi.quantity,
            'price', oi.price
          )
        ) AS items
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN order_items oi ON o.id = oi.order_id
      JOIN dishes d ON oi.dish_id = d.id
      WHERE o.restaurant_id = ?
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;
    
    const [rows] = await db.execute(query, [restaurant_id]);
    
    return rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
  }

  /**
   * Update order status
   */
  static async updateStatus(order_id, status) {
    const deliveredAt = status === 'Delivered' ? new Date() : null;
    
    const [result] = await db.execute(
      'UPDATE orders SET status = ?, delivered_at = ? WHERE id = ?',
      [status, deliveredAt, order_id]
    );

    return result;
  }

  /**
   * Delete order
   */
  static async delete(order_id) {
    // Order items will be deleted automatically due to CASCADE
    const [result] = await db.execute('DELETE FROM orders WHERE id = ?', [order_id]);
    return result;
  }
}

module.exports = Order;

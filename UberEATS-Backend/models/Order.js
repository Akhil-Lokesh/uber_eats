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

    const client = await db.connect();

    try {
      await client.query('BEGIN');

      // Insert main order
      const orderResult = await client.query(
        `INSERT INTO orders (customer_id, restaurant_id, total_price, delivery_address, delivery_phone, notes, status)
         VALUES ($1, $2, $3, $4, $5, $6, 'Pending') RETURNING id`,
        [customer_id, restaurant_id, total_price, delivery_address, delivery_phone || null, notes || null]
      );

      const orderId = orderResult.rows[0].id;

      // Insert order items
      for (const item of items) {
        const subtotal = item.price * item.quantity;
        await client.query(
          `INSERT INTO order_items (order_id, dish_id, quantity, price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [orderId, item.dishId, item.quantity, item.price, subtotal]
        );
      }

      await client.query('COMMIT');
      return { orderId, insertId: orderId };

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
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
        json_agg(
          json_build_object(
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
      WHERE o.customer_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query, [customer_id]);
    const rows = result.rows;

    // Items are already JSON objects in PostgreSQL
    return rows;
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
        json_agg(
          json_build_object(
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
      WHERE o.id = $1
    `;

    const params = [order_id];

    if (customer_id) {
      query += ' AND o.customer_id = $2';
      params.push(customer_id);
    }

    query += ' GROUP BY o.id';

    const result = await db.query(query, params);
    const rows = result.rows;

    if (rows.length === 0) return null;

    return rows[0];
  }

  /**
   * Get orders for a restaurant
   */
  static async getByRestaurant(restaurant_id) {
    const query = `
      SELECT
        o.id, o.status, o.total_price, o.delivery_address, o.created_at,
        u.name AS customer_name, u.email AS customer_email,
        json_agg(
          json_build_object(
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
      WHERE o.restaurant_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `;

    const result = await db.query(query, [restaurant_id]);
    const rows = result.rows;

    // Items are already JSON objects in PostgreSQL
    return rows;
  }

  /**
   * Update order status
   */
  static async updateStatus(order_id, status) {
    const deliveredAt = status === 'Delivered' ? new Date() : null;

    const result = await db.query(
      'UPDATE orders SET status = $1, delivered_at = $2 WHERE id = $3',
      [status, deliveredAt, order_id]
    );

    return result;
  }

  /**
   * Delete order
   */
  static async delete(order_id) {
    // Order items will be deleted automatically due to CASCADE
    const result = await db.query('DELETE FROM orders WHERE id = $1', [order_id]);
    return result;
  }
}

module.exports = Order;

-- Create orders table (fixed for multi-item support)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    delivery_address TEXT NOT NULL,
    delivery_phone VARCHAR(20),
    status VARCHAR(30) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Preparing', 'Out for Delivery', 'Delivered', 'Cancelled')),
    payment_status VARCHAR(20) DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Paid', 'Failed', 'Refunded')),
    payment_method VARCHAR(50),
    notes TEXT,
    estimated_delivery_time TIMESTAMP,
    delivered_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);

-- Create feedbacks table
CREATE TABLE IF NOT EXISTS feedbacks (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL,
    customer_id INT NOT NULL,
    restaurant_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_feedbacks_order_id ON feedbacks(order_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_restaurant_id ON feedbacks(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_rating ON feedbacks(rating);

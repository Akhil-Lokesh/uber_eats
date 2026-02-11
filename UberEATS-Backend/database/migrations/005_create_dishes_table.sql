-- Create dishes table
CREATE TABLE IF NOT EXISTS dishes (
    id SERIAL PRIMARY KEY,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(100),
    image VARCHAR(255),
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INT DEFAULT 30,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX IF NOT EXISTS idx_dishes_category ON dishes(category);
CREATE INDEX IF NOT EXISTS idx_dishes_price ON dishes(price);

COMMENT ON COLUMN dishes.preparation_time IS 'preparation time in minutes';

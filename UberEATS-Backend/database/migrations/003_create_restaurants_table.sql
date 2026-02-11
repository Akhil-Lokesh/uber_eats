-- Create restaurants table
CREATE TABLE IF NOT EXISTS restaurants (
    id SERIAL PRIMARY KEY,
    user_id INT UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    location TEXT,
    phone VARCHAR(20),
    cuisine VARCHAR(100),
    description TEXT,
    image VARCHAR(255),
    is_approved BOOLEAN DEFAULT FALSE,
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_reviews INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_restaurants_email ON restaurants(email);
CREATE INDEX IF NOT EXISTS idx_restaurants_cuisine ON restaurants(cuisine);
CREATE INDEX IF NOT EXISTS idx_restaurants_rating ON restaurants(rating);

-- Create token_blacklist table (persistent token blacklist)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id INT PRIMARY KEY AUTO_INCREMENT,
    token TEXT NOT NULL,
    user_id INT,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_expires_at (expires_at),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event to clean up expired tokens automatically
CREATE EVENT IF NOT EXISTS cleanup_expired_tokens
ON SCHEDULE EVERY 1 HOUR
DO
DELETE FROM token_blacklist WHERE expires_at < NOW();

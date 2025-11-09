-- Create admin_logs table
CREATE TABLE IF NOT EXISTS admin_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_email VARCHAR(255) NOT NULL,
    action VARCHAR(255) NOT NULL,
    target_user_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_email (admin_email),
    INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Insert default super admin (password: Admin@123456)
-- ⚠️ IMPORTANT: Change this password immediately after first deployment!
INSERT INTO admins (email, password, role) VALUES
('admin@ubereats.com', '$2b$12$zC4xXfftSur.9Wv.gQs7zOlsaJ/70yFhP9bohZ64OaxksuKArD4yK', 'super_admin')
ON CONFLICT (email) DO NOTHING;

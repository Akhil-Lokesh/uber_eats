-- Create token_blacklist table (persistent token blacklist)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id SERIAL PRIMARY KEY,
    token TEXT NOT NULL,
    user_id INT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires_at ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user_id ON token_blacklist(user_id);

-- Note: PostgreSQL doesn't have MySQL's EVENT scheduler
-- To auto-cleanup expired tokens, you can:
-- 1. Use pg_cron extension
-- 2. Run cleanup via application code periodically
-- 3. Use a cron job to run: DELETE FROM token_blacklist WHERE expires_at < NOW();

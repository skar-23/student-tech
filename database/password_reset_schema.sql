-- Create password_reset_requests table for verification code-based password reset
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Create unique constraint on email to prevent multiple active requests
    CONSTRAINT unique_email_reset_request UNIQUE (email)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_password_reset_email ON password_reset_requests(email);
CREATE INDEX IF NOT EXISTS idx_password_reset_code ON password_reset_requests(verification_code);
CREATE INDEX IF NOT EXISTS idx_password_reset_expires ON password_reset_requests(expires_at);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_password_reset_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at column
DROP TRIGGER IF EXISTS trigger_update_password_reset_updated_at ON password_reset_requests;
CREATE TRIGGER trigger_update_password_reset_updated_at
    BEFORE UPDATE ON password_reset_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_password_reset_updated_at();

-- Create a function to clean up expired requests (run this periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_password_reset_requests()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM password_reset_requests 
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) if needed
ALTER TABLE password_reset_requests ENABLE ROW LEVEL SECURITY;

-- Create policy to allow operations (adjust based on your security requirements)
-- For development, we'll allow all operations, but in production you should restrict this
CREATE POLICY "Allow password reset operations" ON password_reset_requests
    FOR ALL USING (true);

-- Grant necessary permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_requests TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_requests TO anon;

-- Optional: Create a view for active (non-expired) reset requests
CREATE OR REPLACE VIEW active_password_reset_requests AS
SELECT 
    id,
    email,
    verification_code,
    expires_at,
    verified,
    created_at,
    updated_at
FROM password_reset_requests
WHERE expires_at > NOW();

-- Comments for documentation
COMMENT ON TABLE password_reset_requests IS 'Stores password reset verification codes and their status';
COMMENT ON COLUMN password_reset_requests.email IS 'Email address of the user requesting password reset';
COMMENT ON COLUMN password_reset_requests.verification_code IS '6-digit verification code sent to user';
COMMENT ON COLUMN password_reset_requests.expires_at IS 'When the verification code expires (typically 15 minutes)';
COMMENT ON COLUMN password_reset_requests.verified IS 'Whether the verification code has been confirmed';
COMMENT ON FUNCTION cleanup_expired_password_reset_requests() IS 'Removes expired password reset requests, returns count of deleted rows';

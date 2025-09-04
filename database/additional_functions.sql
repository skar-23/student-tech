-- Additional Supabase functions for the updated password reset system
-- Add these functions to your Supabase database

-- Function to update the verification code (for development)
-- This allows us to set a specific code for testing
CREATE OR REPLACE FUNCTION public.update_reset_code(
    request_email TEXT,
    new_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Update the most recent reset request for this email with our code
  UPDATE public.password_reset_requests
  SET verification_code = new_code,
      updated_at = NOW()
  WHERE email = request_email
    AND expires_at > NOW()
    AND verified = false
  ORDER BY created_at DESC
  LIMIT 1;
END;
$$;

-- Function to clean up expired reset requests
CREATE OR REPLACE FUNCTION public.cleanup_expired_reset_requests()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.password_reset_requests 
  WHERE expires_at < NOW();
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;

-- Function to get reset request status (for debugging)
CREATE OR REPLACE FUNCTION public.get_reset_request_status(
    request_email TEXT
)
RETURNS TABLE(
  id UUID,
  email TEXT,
  verification_code TEXT,
  expires_at TIMESTAMPTZ,
  verified BOOLEAN,
  created_at TIMESTAMPTZ,
  is_expired BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id,
    r.email,
    r.verification_code,
    r.expires_at,
    r.verified,
    r.created_at,
    (r.expires_at < NOW()) as is_expired
  FROM public.password_reset_requests r
  WHERE r.email = request_email
  ORDER BY r.created_at DESC
  LIMIT 1;
END;
$$;

-- Updated request_password_reset function that accepts a verification code
CREATE OR REPLACE FUNCTION public.request_password_reset_with_code(
    request_email TEXT,
    verification_code TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Delete any existing reset request for this email first
  DELETE FROM public.password_reset_requests
  WHERE email = request_email;
  
  -- Insert a new reset request with the provided code
  INSERT INTO public.password_reset_requests(email, verification_code, expires_at)
  VALUES (
    request_email,
    verification_code,
    NOW() + INTERVAL '15 minutes'
  );
END;
$$;

-- Function to check if email is registered (optional security enhancement)
CREATE OR REPLACE FUNCTION public.is_registered_email(
    request_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_exists BOOLEAN;
BEGIN
  -- Check if user exists in auth.users table
  SELECT EXISTS(
    SELECT 1 FROM auth.users 
    WHERE email = request_email 
    AND email_confirmed_at IS NOT NULL
  ) INTO user_exists;
  
  RETURN user_exists;
END;
$$;

-- Grant necessary permissions for these functions
GRANT EXECUTE ON FUNCTION public.update_reset_code(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cleanup_expired_reset_requests() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_reset_request_status(TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.request_password_reset_with_code(TEXT, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_registered_email(TEXT) TO anon, authenticated;

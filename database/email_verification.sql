-- Simple email verification function for password reset
-- Add this to your Supabase SQL Editor

-- Function to check if email exists in profiles table
CREATE OR REPLACE FUNCTION public.check_user_email_exists(
    user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  email_exists BOOLEAN := FALSE;
BEGIN
  -- Check if email exists in profiles table
  SELECT EXISTS(
    SELECT 1 FROM public.profiles 
    WHERE email = user_email
  ) INTO email_exists;
  
  RETURN email_exists;
END;
$$;

-- Grant permission to use this function
GRANT EXECUTE ON FUNCTION public.check_user_email_exists(TEXT) TO anon, authenticated;

-- Alternative: If you want to check auth.users table instead
-- (requires RLS policy adjustment)
CREATE OR REPLACE FUNCTION public.verify_registered_email(
    user_email TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_count INTEGER := 0;
BEGIN
  -- This requires access to auth schema
  -- Check if user exists with confirmed email
  SELECT COUNT(*) INTO user_count
  FROM auth.users 
  WHERE email = user_email 
  AND email_confirmed_at IS NOT NULL;
  
  RETURN user_count > 0;
EXCEPTION
  WHEN OTHERS THEN
    -- Fallback to profiles table if auth access fails
    SELECT COUNT(*) INTO user_count
    FROM public.profiles 
    WHERE email = user_email;
    
    RETURN user_count > 0;
END;
$$;

-- Grant permission
GRANT EXECUTE ON FUNCTION public.verify_registered_email(TEXT) TO anon, authenticated;

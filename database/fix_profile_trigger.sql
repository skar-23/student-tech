-- Fix the profile creation trigger to include email
-- Run this in your Supabase SQL Editor

-- First, let's check the current profiles table structure
-- If the email column doesn't exist, add it
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' 
                  AND column_name = 'email') THEN
        ALTER TABLE public.profiles ADD COLUMN email TEXT;
        RAISE NOTICE 'Added email column to profiles table';
    ELSE
        RAISE NOTICE 'Email column already exists in profiles table';
    END IF;
END
$$;

-- Update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,  -- Add email from auth.users
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verify the trigger is working by checking existing users
-- Fix any existing profiles that are missing emails
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- Show results
SELECT 
    p.id,
    p.email as profile_email,
    u.email as auth_email,
    p.full_name,
    p.username,
    CASE 
        WHEN p.email IS NULL OR p.email = '' THEN 'NEEDS EMAIL'
        WHEN p.email = u.email THEN 'OK'
        ELSE 'MISMATCH'
    END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;

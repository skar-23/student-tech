-- Fix profile creation trigger to resolve signup database error
-- This migration addresses the issue where new user signup fails due to missing email column
-- and missing created_at/updated_at values in the trigger function

-- Step 1: Add email column to profiles table if it doesn't exist
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

-- Step 2: Update the trigger function to fix the signup error
-- Include email from auth.users and provide required created_at/updated_at values
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
    NOW(),      -- Set created_at to current timestamp
    NOW()       -- Set updated_at to current timestamp
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Fix any existing profiles that are missing emails
-- This updates profiles that may have been created before email column existed
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- Step 4: Verify the fix by checking the schema and recent profiles
-- This is just for verification - you can run this in the SQL editor to check results
/*
SELECT 
    p.id,
    p.email as profile_email,
    u.email as auth_email,
    p.full_name,
    p.username,
    p.created_at,
    p.updated_at,
    CASE 
        WHEN p.email IS NULL OR p.email = '' THEN 'MISSING EMAIL'
        WHEN p.email = u.email THEN 'OK'
        ELSE 'EMAIL MISMATCH'
    END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
*/
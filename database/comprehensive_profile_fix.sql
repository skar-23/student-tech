-- Comprehensive fix for profile creation with email
-- Run this script in your Supabase SQL Editor

-- Step 1: Ensure the profiles table has the email column
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

-- Step 2: Create or update the trigger function to include email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
    NEW.email,  -- Include email from auth.users
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Ensure the trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Fix any existing profiles that are missing emails
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- Step 5: Add a unique constraint on email (optional, for data integrity)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'profiles_email_unique') THEN
        ALTER TABLE public.profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);
        RAISE NOTICE 'Added unique constraint on email column';
    ELSE
        RAISE NOTICE 'Unique constraint on email already exists';
    END IF;
EXCEPTION
    WHEN duplicate_table THEN
        RAISE NOTICE 'Unique constraint on email already exists';
END
$$;

-- Step 6: Verify the results
SELECT 
    p.id,
    p.email as profile_email,
    u.email as auth_email,
    p.full_name,
    p.username,
    p.created_at,
    CASE 
        WHEN p.email IS NULL OR p.email = '' THEN 'MISSING EMAIL'
        WHEN p.email = u.email THEN 'OK'
        ELSE 'MISMATCH'
    END as status
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
ORDER BY p.created_at DESC
LIMIT 10;
-- Fix existing profiles that are missing email addresses
-- Run this in your Supabase SQL Editor

-- Update profiles table with emails from auth.users
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');

-- Verify the update worked
SELECT 
    p.id,
    p.email as profile_email,
    u.email as auth_email,
    p.full_name,
    p.username
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- Show any profiles still missing emails
SELECT 
    p.id,
    p.email as profile_email,
    u.email as auth_email,
    p.full_name,
    p.username,
    'Missing email in profile' as issue
FROM public.profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.email IS NULL OR p.email = ''
ORDER BY p.created_at DESC;

# Fix for 500 Signup Error

## Problem Description

Users are encountering a 500 server error when trying to sign up. The error occurs because:

1. **Missing Email Column**: The `profiles` table is missing an `email` column
2. **Incomplete Trigger Function**: The `handle_new_user()` database trigger function doesn't include the email field when creating user profiles
3. **Database Schema Mismatch**: When users sign up, the trigger fails to create the profile properly

## Root Cause

The database migration `20250903044452_c104f744-4b19-4ede-8c2b-d2f2bb5e22d4.sql` creates the `profiles` table without an `email` column:

```sql
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  credits INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

And the trigger function in `20250903044510_411917bd-034d-4cb6-8338-8febd9b74d55.sql` doesn't include email:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

## Solution

### 1. Database Migration (Required)

Run the migration `supabase/migrations/20250904000000_fix_profile_email_signup.sql` in your Supabase SQL Editor:

```sql
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

-- Step 2: Update the trigger function to include email from auth.users
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Step 3: Fix existing profiles that are missing emails
UPDATE public.profiles 
SET email = auth.users.email,
    updated_at = NOW()
FROM auth.users 
WHERE public.profiles.id = auth.users.id 
AND (public.profiles.email IS NULL OR public.profiles.email = '');
```

### 2. Application-Level Fallback (Implemented)

The following application-level changes have been made to provide fallback functionality:

#### Enhanced Signup Process (`src/hooks/useAuth.tsx`)
- Added fallback profile creation if the database trigger fails
- Checks for profile existence after signup
- Updates profile email if missing
- Provides better error handling and logging

#### Fixed Fix Functions
- Updated `src/lib/auth/fix-profile-email.ts` to use proper Supabase client methods
- Updated `src/lib/fix-profile-trigger.ts` to work correctly
- Removed invalid `supabase.query()` calls that don't exist in the Supabase client

#### Available Scripts
- `npm run fix-profile-emails` - Run the client-side profile fix
- `npm run fix-profile-trigger` - Run the client-side trigger fix

## How to Apply the Fix

### Option 1: Database Migration (Recommended)
1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Run the migration file: `supabase/migrations/20250904000000_fix_profile_email_signup.sql`
4. This will permanently fix the issue at the database level

### Option 2: Manual SQL Execution
1. Open Supabase SQL Editor
2. Copy and paste the SQL from the migration file
3. Execute the queries

### Option 3: Client-Side Fix (Temporary)
1. Sign in as an existing user
2. Run `npm run fix-profile-emails` to fix current user's profile
3. This only fixes individual profiles, not the underlying trigger

## Verification

After applying the fix, you can verify it's working by:

1. **Testing Signup**: Try creating a new user account
2. **Checking Database**: Run this query in Supabase SQL Editor:
   ```sql
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
   ```

## Files Changed

- `supabase/migrations/20250904000000_fix_profile_email_signup.sql` - New migration to fix the issue
- `src/hooks/useAuth.tsx` - Enhanced signup with fallback profile creation
- `src/lib/auth/fix-profile-email.ts` - Fixed to use proper Supabase client methods
- `src/lib/fix-profile-trigger.ts` - Fixed to use proper Supabase client methods
- `SIGNUP_FIX_README.md` - This documentation file

## Error Message Reference

Before fix:
```
Failed to load resource: the server responded with a status of 500 ()
abkesxkseozwrsatlnin.supabase.co/auth/v1/signup:1 Failed to load resource: the server responded with a status of 500 ()
```

After fix:
- Signup should complete successfully
- Profile should be created with email included
- No 500 errors should occur
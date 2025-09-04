# Database Signup Error Fix

## Problem
Users were getting database errors when trying to sign up for a new account. The signup process would fail silently or with database constraint errors.

## Root Cause
The issue was in the `handle_new_user()` database trigger function that automatically creates a profile when a new user signs up through Supabase Auth. The function had two main issues:

1. **Missing Email Column**: The `profiles` table didn't have an `email` column, but the fix scripts expected it to exist
2. **Missing Required Fields**: The trigger function wasn't providing values for `created_at` and `updated_at` columns that have NOT NULL constraints

## Solution
Created migration `20250904000000_fix_profile_signup_error.sql` that:

1. **Adds email column** to the profiles table if it doesn't exist
2. **Updates the trigger function** to include:
   - Email from `auth.users.email`
   - Proper `created_at` timestamp using `NOW()`
   - Proper `updated_at` timestamp using `NOW()`
3. **Backfills existing profiles** that are missing email addresses
4. **Maintains security** with proper `SECURITY DEFINER` and `search_path` settings

## Files Modified
- `supabase/migrations/20250904000000_fix_profile_signup_error.sql` (new)

## Testing
After applying this migration, the signup process should work correctly:
1. New users can sign up without database errors
2. Profiles are created automatically with all required fields
3. Email addresses are properly stored in the profiles table
4. Existing users' profiles are updated with email addresses

## How the Fix Works
The updated trigger function now properly handles all required fields:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url, email, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.email,  -- Email from auth.users
    NOW(),      -- Created timestamp
    NOW()       -- Updated timestamp
  );
  RETURN NEW;
END;
```

This ensures that when a new user signs up through Supabase Auth, their profile is created successfully with all required data.
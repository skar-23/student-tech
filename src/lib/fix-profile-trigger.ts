import { supabase } from '@/integrations/supabase/client';

/**
 * This function fixes the profile creation trigger to include email
 * and updates existing profiles that are missing emails.
 */
export async function fixProfileTrigger() {
  try {
    console.log('🔧 Starting profile trigger fix...');
    
    // Step 1: Check if email column exists in profiles table, add if it doesn't
    const { error: columnError } = await supabase.query(`
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
    `);
    
    if (columnError) {
      console.error('Error checking/adding email column:', columnError);
      return { success: false, message: 'Failed to check/add email column' };
    }
    
    // Step 2: Update the trigger function to include email
    const { error: functionError } = await supabase.query(`
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        INSERT INTO public.profiles (id, username, full_name, avatar_url, email)
        VALUES (
          NEW.id,
          NEW.raw_user_meta_data->>'username',
          NEW.raw_user_meta_data->>'full_name',
          NEW.raw_user_meta_data->>'avatar_url',
          NEW.email  -- Add email from auth.users
        );
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    
    if (functionError) {
      console.error('Error updating trigger function:', functionError);
      return { success: false, message: 'Failed to update trigger function' };
    }
    
    // Step 3: Fix existing profiles that are missing emails
    const { error: updateError } = await supabase.query(`
      UPDATE public.profiles 
      SET email = auth.users.email,
          updated_at = NOW()
      FROM auth.users 
      WHERE public.profiles.id = auth.users.id 
      AND (public.profiles.email IS NULL OR public.profiles.email = '');
    `);
    
    if (updateError) {
      console.error('Error updating existing profiles:', updateError);
      return { 
        success: false, 
        message: 'Updated trigger function but failed to update existing profiles' 
      };
    }
    
    console.log('✅ Profile trigger fix completed successfully');
    return { 
      success: true, 
      message: 'Successfully updated trigger function and fixed existing profiles' 
    };
  } catch (error) {
    console.error('Error in fixProfileTrigger:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while fixing profile trigger' 
    };
  }
}
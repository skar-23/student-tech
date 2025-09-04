import { supabase } from '@/integrations/supabase/client';

/**
 * This function fixes the profile creation trigger to include email
 * and updates existing profiles that are missing emails.
 */
export const fixProfileEmailIssue = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔧 Starting profile email fix...');
    
    // Step 1: Check if email column exists in profiles table
    const { data: columnCheck, error: columnError } = await supabase.rpc(
      'check_column_exists',
      { table_name: 'profiles', column_name: 'email' }
    );
    
    // If RPC function doesn't exist, try a direct query
    if (columnError) {
      console.log('Using direct query to check column existence');
      // Add email column if it doesn't exist
      await supabase.query(`
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
    }
    
    // Step 2: Update the trigger function to include email
    const { error: functionError } = await supabase.query(`
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
    
    console.log('✅ Profile email fix completed successfully');
    return { 
      success: true, 
      message: 'Successfully updated trigger function and fixed existing profiles' 
    };
  } catch (error) {
    console.error('Error in fixProfileEmailIssue:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while fixing profile emails' 
    };
  }
};
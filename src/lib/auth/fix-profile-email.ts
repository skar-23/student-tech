import { supabase } from '@/integrations/supabase/client';

/**
 * This function provides a client-side workaround for profile email issues.
 * Note: Database schema changes must be done through migrations in the Supabase dashboard.
 * 
 * This function:
 * 1. Checks existing profiles for missing emails
 * 2. Updates profiles that are missing emails from auth.users data
 * 3. Reports on the status of profiles
 */
export const fixProfileEmailIssue = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔧 Starting profile email fix...');
    
    // Get current user to ensure we have permission
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated. Please sign in first.'
      };
    }

    // Check current user's profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username, full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        console.log('📝 Profile not found, creating...');
        
        const { error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            username: user.user_metadata?.username || null,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });

        if (createError) {
          console.error('❌ Error creating profile:', createError);
          return {
            success: false,
            message: `Failed to create profile: ${createError.message}`
          };
        }

        console.log('✅ Profile created successfully');
        return {
          success: true,
          message: 'Profile created with email successfully'
        };
      } else {
        console.error('❌ Error checking profile:', profileError);
        return {
          success: false,
          message: `Failed to check profile: ${profileError.message}`
        };
      }
    }

    // Profile exists, check if email needs to be updated
    if (!profile.email && user.email) {
      console.log('📧 Updating profile email...');
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          email: user.email,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        console.error('❌ Error updating profile email:', updateError);
        return {
          success: false,
          message: `Failed to update profile email: ${updateError.message}`
        };
      }

      console.log('✅ Profile email updated successfully');
      return {
        success: true,
        message: 'Profile email updated successfully'
      };
    }

    // Profile already has email
    console.log('✅ Profile already has email set');
    return {
      success: true,
      message: 'Profile already has email - no action needed'
    };

  } catch (error) {
    console.error('Error in fixProfileEmailIssue:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while fixing profile emails' 
    };
  }
};
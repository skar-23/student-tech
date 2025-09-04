import { supabase } from '@/integrations/supabase/client';

/**
 * This function provides a client-side check and fix for profile issues.
 * Note: Database trigger and schema changes must be done through migrations.
 * 
 * This function can be used to manually fix user profiles that are missing
 * emails due to the trigger issue.
 */
export async function fixProfileTrigger() {
  try {
    console.log('🔧 Starting profile trigger fix check...');
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return {
        success: false,
        message: 'User not authenticated. Please sign in first.'
      };
    }

    console.log('👤 Checking profile for user:', user.email);

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        // No profile found, create one
        console.log('📝 No profile found, creating profile...');
        
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
          message: 'Profile created successfully with email'
        };
      } else {
        console.error('❌ Error checking profile:', profileError);
        return {
          success: false,
          message: `Error checking profile: ${profileError.message}`
        };
      }
    }

    // Profile exists, check if it needs email update
    if (!profile.email && user.email) {
      console.log('📧 Profile missing email, updating...');
      
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

      console.log('✅ Profile email updated');
      return {
        success: true,
        message: 'Profile email updated successfully'
      };
    }

    console.log('✅ Profile is already correctly configured');
    return {
      success: true,
      message: 'Profile is already correctly configured'
    };

  } catch (error) {
    console.error('Error in fixProfileTrigger:', error);
    return { 
      success: false, 
      message: 'An unexpected error occurred while fixing profile trigger' 
    };
  }
}
import { supabase } from '@/integrations/supabase/client';
import { sendPasswordResetEmailSecure } from '@/lib/email/email-api';

// Types for password reset flow
export interface PasswordResetRequest {
  email: string;
  verification_code: string;
  expires_at: string;
  verified: boolean;
  id: string;
}

export interface SendVerificationCodeRequest {
  email: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

// Generate a 6-digit verification code
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification code to email
export const sendVerificationCode = async (email: string): Promise<{ success: boolean; message: string; requestId?: string }> => {
  try {
    // Verify if the email is registered
    let isRegistered = false;
    
    try {
      // Check profiles table first (primary method)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('email, id')
        .eq('email', email.toLowerCase())
        .limit(1);
      
      if (!profileError && profiles && profiles.length > 0) {
        isRegistered = true;
      } else {
        // Fallback: Check auth.users table
        try {
          const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
          
          if (!authError && users) {
            const userExists = users.some(user => 
              user.email?.toLowerCase() === email.toLowerCase()
            );
            
            if (userExists) {
              isRegistered = true;
            }
          }
        } catch (authError) {
          // If admin API fails, user is not registered
          isRegistered = false;
        }
      }
      
    } catch (e) {
      console.error('Error in email verification:', e);
      isRegistered = false;
    }
    
    // If email is not registered, return error message
    if (!isRegistered) {
      return {
        success: false,
        message: 'Email address not found. Please check your email and try again.'
      };
    }
    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Try to use existing Supabase function for password reset
    const { error } = await supabase.rpc('request_password_reset', {
      request_email: email.toLowerCase()
    });

    if (error) {
      // Handle duplicate key (existing active request)
      const code = (error as any)?.code || (error as any)?.status;
      const details = (error as any)?.details || (error as any)?.message;
      const isDuplicate = code === 409 || code === '23505' || (typeof details === 'string' && details.toLowerCase().includes('already exists'));
      if (!isDuplicate) {
        console.error('Error creating password reset request:', error);
        return { success: false, message: 'If this email is registered, you will receive a verification code.' };
      }
    }

    // Send the verification code via email
    const emailResult = await sendPasswordResetEmailSecure({
      to: email,
      verificationCode: verificationCode,
      expiryMinutes: 15
    });
    
    // Store the code in sessionStorage for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`reset_code_${email.toLowerCase()}`, verificationCode);
      const expiryTime = Date.now() + (15 * 60 * 1000); // 15 minutes
      sessionStorage.setItem(`reset_code_expiry_${email.toLowerCase()}`, expiryTime.toString());
    }
    
    if (emailResult.success) {
      return { 
        success: true, 
        message: 'Verification code sent to your email! Check your inbox and enter the 6-digit code to continue.',
        requestId: 'generated'
      };
    } else {
      return {
        success: false,
        message: emailResult.message
      };
    }
  } catch (error) {
    console.error('Error in sendVerificationCode:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
};

// Verify the verification code
export const verifyResetCode = async (email: string, code: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check sessionStorage for the verification code
    if (typeof window !== 'undefined') {
      const storedCode = sessionStorage.getItem(`reset_code_${email.toLowerCase()}`);
      const expiryTime = sessionStorage.getItem(`reset_code_expiry_${email.toLowerCase()}`);
      
      if (storedCode === code) {
        // Check if code has expired
        if (expiryTime && Date.now() > parseInt(expiryTime)) {
          // Clean up expired code
          sessionStorage.removeItem(`reset_code_${email.toLowerCase()}`);
          sessionStorage.removeItem(`reset_code_expiry_${email.toLowerCase()}`);
          return { success: false, message: 'Verification code has expired. Please request a new one.' };
        }
        
        // Try to verify using Supabase function first
        try {
          const { data: isVerified, error } = await supabase.rpc('verify_password_reset', {
            request_email: email.toLowerCase(),
            request_code: code
          });

          if (!error && isVerified) {
            sessionStorage.setItem(`reset_verified_${email.toLowerCase()}`, 'true');
            return { success: true, message: 'Verification code confirmed.' };
          }
        } catch (e) {
          // Fallback to sessionStorage verification
        }
        
        // Mark as verified in sessionStorage for fallback
        sessionStorage.setItem(`reset_verified_${email.toLowerCase()}`, 'true');
        return { success: true, message: 'Verification code confirmed.' };
      }
    }

    // Try the Supabase function to verify the code
    try {
      const { data: isVerified, error } = await supabase.rpc('verify_password_reset', {
        request_email: email.toLowerCase(),
        request_code: code
      });

      if (error) {
        return { success: false, message: 'Invalid or expired verification code.' };
      }

      if (isVerified) {
        return { success: true, message: 'Verification code confirmed.' };
      }
    } catch (error) {
      // Function not available, fail verification
    }
    
    return { success: false, message: 'Invalid or expired verification code.' };
  } catch (error) {
    console.error('Error in verifyResetCode:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
};

// Reset password after verification
export const resetPassword = async (email: string, code: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Check if verification was completed
    let isVerified = false;
    
    // Check sessionStorage verification
    if (typeof window !== 'undefined') {
      const sessionVerified = sessionStorage.getItem(`reset_verified_${email.toLowerCase()}`);
      const storedCode = sessionStorage.getItem(`reset_code_${email.toLowerCase()}`);
      const expiryTime = sessionStorage.getItem(`reset_code_expiry_${email.toLowerCase()}`);
      
      if (sessionVerified === 'true' && storedCode === code) {
        // Check if still within expiry time
        if (!expiryTime || Date.now() <= parseInt(expiryTime)) {
          isVerified = true;
        }
      }
    }
    
    // If not verified via sessionStorage, try Supabase function
    if (!isVerified) {
      try {
        const { data: supabaseVerified, error: verifyError } = await supabase.rpc('verify_password_reset', {
          request_email: email.toLowerCase(),
          request_code: code
        });
        
        if (!verifyError && supabaseVerified) {
          isVerified = true;
        }
      } catch (e) {
        // Function not available
      }
    }

    if (!isVerified) {
      return { success: false, message: 'Invalid or expired verification session. Please request a new code.' };
    }

    // Find and update the user password
    try {
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error('Error listing users:', authError);
        return { success: false, message: 'Failed to find user. Please try again.' };
      }

      const user = authUsers.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      // Update user password using admin API
      const { error: passwordError } = await supabase.auth.admin.updateUserById(
        user.id, 
        { password: newPassword }
      );

      if (passwordError) {
        console.error('Error updating password:', passwordError);
        return { success: false, message: 'Failed to update password. Please try again.' };
      }

      // Clean up sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem(`reset_code_${email.toLowerCase()}`);
        sessionStorage.removeItem(`reset_code_expiry_${email.toLowerCase()}`);
        sessionStorage.removeItem(`reset_verified_${email.toLowerCase()}`);
      }

      return { success: true, message: 'Password has been successfully reset. You can now sign in with your new password.' };
    } catch (adminError) {
      console.error('Admin API not available:', adminError);
      return { success: false, message: 'Password reset requires admin privileges. Please contact support.' };
    }
  } catch (error) {
    console.error('Error in resetPassword:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
};

// Alternative method using Supabase's built-in password reset (if you prefer email links)
export const sendPasswordResetEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/#/reset-password-confirm`,
    });

    if (error) {
      console.error('Error sending reset email:', error);
      return { success: false, message: 'Failed to send reset email. Please try again.' };
    }

    return { success: true, message: 'Password reset email sent. Check your inbox.' };
  } catch (error) {
    console.error('Error in sendPasswordResetEmail:', error);
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
};

// Clean up expired reset requests (you might want to run this periodically)
export const cleanupExpiredRequests = async (): Promise<void> => {
  const now = new Date().toISOString();
  
  await supabase
    .from('password_reset_requests')
    .delete()
    .lt('expires_at', now);
};

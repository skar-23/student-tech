import { fixProfileEmailIssue } from '../src/lib/auth/fix-profile-email.js';

/**
 * This script fixes the profile creation trigger to include email
 * and updates existing profiles that are missing emails.
 */
async function main() {
  console.log('🔧 Starting profile email fix script...');
  
  try {
    const result = await fixProfileEmailIssue();
    
    if (result.success) {
      console.log('✅ Success:', result.message);
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
  
  console.log('🏁 Script execution completed');
}

// Execute the script
main();
// Simple script to run the fix-profile-trigger function

console.log('🔧 Running profile trigger fix script...');

// Import the function directly (works in Node.js with the project's setup)
import('../src/lib/fix-profile-trigger.js')
  .then(({ fixProfileTrigger }) => {
    return fixProfileTrigger();
  })
  .then((result) => {
    if (result.success) {
      console.log('✅ Success:', result.message);
    } else {
      console.error('❌ Error:', result.message);
    }
    console.log('🏁 Script execution completed');
  })
  .catch((error) => {
    console.error('❌ Unexpected error:', error);
    console.log('🏁 Script execution completed with error');
    process.exit(1);
  });
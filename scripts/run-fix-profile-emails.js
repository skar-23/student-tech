// Simple script to run the fix-profile-emails.ts file

import { execSync } from 'child_process';

console.log('🔧 Running profile email fix script...');

try {
  // Run the TypeScript file using tsx (which is available in the project)
  execSync('npx tsx ./scripts/fix-profile-emails.ts', { stdio: 'inherit' });
  console.log('✅ Script executed successfully');
} catch (error) {
  console.error('❌ Error executing script:', error.message);
  process.exit(1);
}
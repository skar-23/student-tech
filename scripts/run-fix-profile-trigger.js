// Script to run the fix-profile-trigger function

import { createServer } from 'http';
import { parse } from 'url';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Starting profile trigger fix script...');

// Start a simple server to run the fix
const server = createServer(async (req, res) => {
  const parsedUrl = parse(req.url, true);
  
  if (parsedUrl.pathname === '/fix-profile-trigger') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    
    try {
      // Import dynamically to avoid issues with ESM/CJS
      const { fixProfileTrigger } = await import('../src/lib/fix-profile-trigger.ts');
      const result = await fixProfileTrigger();
      
      console.log(result.success ? '✅ Success:' : '❌ Error:', result.message);
      res.end(JSON.stringify(result));
      
      // Close the server after processing
      setTimeout(() => {
        server.close(() => {
          console.log('🏁 Server closed, script execution completed');
          process.exit(0);
        });
      }, 1000);
    } catch (error) {
      console.error('❌ Unexpected error:', error);
      res.end(JSON.stringify({ 
        success: false, 
        message: 'An unexpected error occurred' 
      }));
      
      // Close the server after error
      setTimeout(() => {
        server.close(() => {
          console.log('🏁 Server closed due to error');
          process.exit(1);
        });
      }, 1000);
    }
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Start server on a random port
server.listen(0, () => {
  const port = server.address().port;
  console.log(`Server started on port ${port}`);
  
  // Open the fix endpoint in the default browser
  const url = `http://localhost:${port}/fix-profile-trigger`;
  console.log(`Opening ${url}`);
  
  try {
    // Open the URL in the default browser
    execSync(`start ${url}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Failed to open browser:', error.message);
    console.log('Please manually open the URL in your browser');
  }
});
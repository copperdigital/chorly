// Cloudflare Pages build script
const { execSync } = require('child_process');

console.log('Starting Cloudflare Pages build...');

try {
  // Use npx to run vite directly from node_modules
  console.log('Building frontend with npx vite...');
  execSync('npx --yes vite@latest build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed, trying alternative approach...');
  
  try {
    // Fallback: install and run vite
    execSync('npm install vite@latest && npx vite build', { stdio: 'inherit' });
    console.log('Build completed with fallback approach!');
  } catch (fallbackError) {
    console.error('Both build approaches failed:', fallbackError.message);
    process.exit(1);
  }
}
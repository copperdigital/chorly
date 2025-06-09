// Simple frontend-only build script for Cloudflare Pages
const { execSync } = require('child_process');

try {
  console.log('Building frontend for Cloudflare Pages...');
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
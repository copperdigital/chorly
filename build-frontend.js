// Build script for Cloudflare Pages deployment
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

try {
  console.log('Building frontend for Cloudflare Pages...');
  
  // Build the frontend
  execSync('npx vite build', { stdio: 'inherit' });
  
  // Move files from dist/public to dist (Cloudflare Pages expects files in dist root)
  const publicDir = path.join(__dirname, 'dist', 'public');
  const distDir = path.join(__dirname, 'dist');
  
  if (fs.existsSync(publicDir)) {
    console.log('Moving build files to correct location...');
    
    // Get all files from dist/public
    const files = fs.readdirSync(publicDir);
    
    // Move each file/directory to dist root
    files.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(distDir, file);
      
      // Remove destination if it exists
      if (fs.existsSync(destPath)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      
      // Move file/directory
      fs.renameSync(srcPath, destPath);
    });
    
    // Remove empty public directory
    fs.rmdirSync(publicDir);
    console.log('Build files moved successfully!');
  }
  
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
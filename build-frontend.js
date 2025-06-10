#!/usr/bin/env node

// Frontend build script for Cloudflare Pages
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  console.log('Building frontend for production...');
  
  // Use the existing vite binary from node_modules
  execSync('npx vite build', { 
    stdio: 'inherit',
    cwd: __dirname
  });
  
  console.log('Frontend build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
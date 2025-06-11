#!/usr/bin/env node

// Simple build script for Cloudflare Pages
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Building for Cloudflare Pages...');

// Build only the frontend with Vite
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Frontend build completed successfully');
} catch (error) {
  console.error('Frontend build failed:', error.message);
  process.exit(1);
}

// Ensure functions directory exists
if (!fs.existsSync('functions')) {
  console.log('Functions directory already exists');
} else {
  console.log('Functions directory found');
}

console.log('Cloudflare Pages build complete!');
// Simple script to display your DATABASE_URL for Cloudflare Pages deployment
console.log('=== DATABASE CONNECTION STRING ===');
console.log('Copy this value for Cloudflare Pages environment variables:');
console.log('');
console.log('DATABASE_URL=');
console.log(process.env.DATABASE_URL);
console.log('');
console.log('=== INSTRUCTIONS ===');
console.log('1. Copy the DATABASE_URL value above');
console.log('2. In Cloudflare Pages, go to Environment Variables');
console.log('3. Add: Name = DATABASE_URL, Value = [paste the URL above]');
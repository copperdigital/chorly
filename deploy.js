const fs = require('fs');
const path = require('path');

// Copy the corrected index.html to ensure deployment
const sourceFile = path.join(__dirname, 'index.html');
const targetFile = path.join(__dirname, 'dist', 'index.html');

// Create dist directory if it doesn't exist
if (!fs.existsSync(path.dirname(targetFile))) {
    fs.mkdirSync(path.dirname(targetFile), { recursive: true });
}

// Copy the file
fs.copyFileSync(sourceFile, targetFile);
console.log('Deployment files prepared');
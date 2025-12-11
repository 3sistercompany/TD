const fs = require('fs');
const path = require('path');

// Get the target directory (Railway volume or local data folder)
const targetDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'data');
const targetDbPath = path.join(targetDir, 'td_logistics.db');
const sourceDbPath = path.join(process.cwd(), 'data', 'td_logistics.db');

console.log('🔧 Checking database...');
console.log(`   Target directory: ${targetDir}`);
console.log(`   Target DB path: ${targetDbPath}`);

// Ensure target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('   ✅ Created target directory');
}

// Check if database exists on the volume
if (fs.existsSync(targetDbPath)) {
  console.log('   ✅ Database already exists on volume');
} else {
  // Check if we have a source database to copy
  if (fs.existsSync(sourceDbPath) && targetDir !== path.join(process.cwd(), 'data')) {
    // Copy the database from the app to the volume
    fs.copyFileSync(sourceDbPath, targetDbPath);
    console.log('   ✅ Copied database to volume');
  } else if (!fs.existsSync(sourceDbPath)) {
    console.log('   ⚠️ No source database found, will be created on first request');
  } else {
    console.log('   ✅ Using local database');
  }
}

console.log('✅ Database initialization complete');

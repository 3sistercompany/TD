const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'td_logistics.db');
const db = new Database(dbPath);

// Create platforms directory in public if it doesn't exist
const platformsDir = path.join(process.cwd(), 'public', 'platforms');
if (!fs.existsSync(platformsDir)) {
  fs.mkdirSync(platformsDir, { recursive: true });
}

// Copy platform logos from ecommerce-platforms_logos to public/platforms
const sourceDir = path.join(process.cwd(), 'ecommerce-platforms_logos');
const files = fs.readdirSync(sourceDir);

console.log('📁 Copying platform logos to public/platforms...');
for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(platformsDir, file);
  fs.copyFileSync(sourcePath, destPath);
  console.log(`   ✅ Copied ${file}`);
}

// Delete all existing platforms
console.log('\n🗑️  Deleting existing platforms...');
db.prepare('DELETE FROM brands').run();
console.log('   ✅ All platforms deleted');

// Insert new platforms
console.log('\n📝 Adding new e-commerce platforms...');

const platforms = [
  {
    name: 'Salla',
    logo_url: '/platforms/salla.webp',
    type: 'platform',
    sort_order: 1
  },
  {
    name: 'Zid',
    logo_url: '/platforms/zid.webp',
    type: 'platform',
    sort_order: 2
  },
  {
    name: 'Shopify',
    logo_url: '/platforms/shopify.png',
    type: 'platform',
    sort_order: 3
  },
  {
    name: 'WooCommerce',
    logo_url: '/platforms/woocommerce.webp',
    type: 'platform',
    sort_order: 4
  },
  {
    name: 'Amazon',
    logo_url: '/platforms/amazon.svg',
    type: 'platform',
    sort_order: 5
  }
];

const insertPlatform = db.prepare(`
  INSERT INTO brands (name, logo_url, type, sort_order, is_active)
  VALUES (?, ?, ?, ?, 1)
`);

for (const platform of platforms) {
  insertPlatform.run(platform.name, platform.logo_url, platform.type, platform.sort_order);
  console.log(`   ✅ Added ${platform.name}`);
}

db.close();
console.log('\n✅ Platforms update complete!');
console.log(`   Total platforms: ${platforms.length}`);

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(process.cwd(), 'data', 'td_logistics.db');
const db = new Database(dbPath);

// Create clients directory in public if it doesn't exist
const clientsDir = path.join(process.cwd(), 'public', 'clients');
if (!fs.existsSync(clientsDir)) {
  fs.mkdirSync(clientsDir, { recursive: true });
}

// Copy client logos from clients_logos to public/clients
const sourceDir = path.join(process.cwd(), 'clients_logos');
const files = fs.readdirSync(sourceDir);

console.log('📁 Copying client logos to public/clients...');
for (const file of files) {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(clientsDir, file);
  fs.copyFileSync(sourcePath, destPath);
  console.log(`   ✅ Copied ${file}`);
}

// Delete all existing clients
console.log('\n🗑️  Deleting existing clients...');
db.prepare('DELETE FROM clients').run();
console.log('   ✅ All clients deleted');

// Insert new clients
console.log('\n📝 Adding new clients...');

const clients = [
  {
    name: 'Client 1',
    logo_url: '/clients/1.jpg',
    sort_order: 1
  },
  {
    name: 'Client 2',
    logo_url: '/clients/2.png',
    sort_order: 2
  },
  {
    name: 'Client 3',
    logo_url: '/clients/3.png',
    sort_order: 3
  },
  {
    name: 'Client 4',
    logo_url: '/clients/4.png',
    sort_order: 4
  },
  {
    name: 'Client 5',
    logo_url: '/clients/5.jpg',
    sort_order: 5
  },
  {
    name: 'Client 6',
    logo_url: '/clients/6.webp',
    sort_order: 6
  }
];

const insertClient = db.prepare(`
  INSERT INTO clients (name, logo_url, sort_order, is_active)
  VALUES (?, ?, ?, 1)
`);

for (const client of clients) {
  insertClient.run(client.name, client.logo_url, client.sort_order);
  console.log(`   ✅ Added ${client.name}`);
}

db.close();
console.log('\n✅ Clients update complete!');
console.log(`   Total clients: ${clients.length}`);

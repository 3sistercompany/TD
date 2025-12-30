/**
 * Migrate brands and clients with column mapping
 */

const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrateBrandsAndClients() {
  const localDbPath = path.join(process.cwd(), 'data', 'td_logistics.db');
  const localDb = new Database(localDbPath, { readonly: true });

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });

  console.log('=== MIGRATING BRANDS ===\n');

  // Migrate brands - only select columns that exist in Turso
  const brands = localDb.prepare('SELECT id, name, logo_url, type, is_active, sort_order, created_at FROM brands').all();
  console.log(`Found ${brands.length} brands`);

  for (const brand of brands) {
    try {
      await tursoClient.execute({
        sql: 'INSERT OR REPLACE INTO brands (id, name, logo_url, type, is_active, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        args: [brand.id, brand.name, brand.logo_url, brand.type, brand.is_active, brand.sort_order, brand.created_at]
      });
      console.log(`✅ Brand: ${brand.name}`);
    } catch (err) {
      console.error(`❌ Brand ${brand.name}: ${err.message}`);
    }
  }

  console.log('\n=== MIGRATING CLIENTS ===\n');

  // Migrate clients - only select columns that exist in Turso
  const clients = localDb.prepare('SELECT id, name, logo_url, is_active, sort_order, created_at FROM clients').all();
  console.log(`Found ${clients.length} clients`);

  for (const client of clients) {
    try {
      await tursoClient.execute({
        sql: 'INSERT OR REPLACE INTO clients (id, name, logo_url, is_active, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        args: [client.id, client.name, client.logo_url, client.is_active, client.sort_order, client.created_at]
      });
      console.log(`✅ Client: ${client.name}`);
    } catch (err) {
      console.error(`❌ Client ${client.name}: ${err.message}`);
    }
  }

  console.log('\n=== VERIFICATION ===\n');

  const brandsCount = await tursoClient.execute('SELECT COUNT(*) as count FROM brands');
  const clientsCount = await tursoClient.execute('SELECT COUNT(*) as count FROM clients');

  console.log(`📋 brands: ${brandsCount.rows[0].count} rows`);
  console.log(`📋 clients: ${clientsCount.rows[0].count} rows`);

  localDb.close();
  tursoClient.close();
}

migrateBrandsAndClients();

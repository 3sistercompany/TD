/**
 * Migrate data from local SQLite to Turso
 */

const { createClient } = require('@libsql/client');
const Database = require('better-sqlite3');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function migrateData() {
  // Connect to local SQLite
  const localDbPath = path.join(process.cwd(), 'data', 'td_logistics.db');
  console.log('Connecting to local SQLite:', localDbPath);
  
  let localDb;
  try {
    localDb = new Database(localDbPath, { readonly: true });
  } catch (err) {
    console.error('Error opening local database:', err.message);
    process.exit(1);
  }

  // Connect to Turso
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (!tursoUrl || !tursoToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  console.log('Connecting to Turso:', tursoUrl);
  const tursoClient = createClient({ url: tursoUrl, authToken: tursoToken });

  // Tables to migrate
  const tables = [
    'users',
    'admin_users', 
    'blog_posts',
    'brands',
    'clients',
    'contact_submissions',
    'customer_reviews',
    'newsletter_subscribers',
    'quote_requests',
    'career_applications'
  ];

  console.log('\n=== STARTING MIGRATION ===\n');

  for (const table of tables) {
    try {
      // Check if table exists in local DB
      const tableExists = localDb.prepare(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=?"
      ).get(table);

      if (!tableExists) {
        console.log(`⏭️  ${table}: Table doesn't exist in local DB, skipping`);
        continue;
      }

      // Get all rows from local DB
      const rows = localDb.prepare(`SELECT * FROM ${table}`).all();
      
      if (rows.length === 0) {
        console.log(`⏭️  ${table}: No data to migrate`);
        continue;
      }

      console.log(`📦 ${table}: Migrating ${rows.length} rows...`);

      // Get column names from first row
      const columns = Object.keys(rows[0]);
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

      // Insert each row
      let successCount = 0;
      for (const row of rows) {
        try {
          const values = columns.map(col => row[col]);
          await tursoClient.execute({ sql: insertSql, args: values });
          successCount++;
        } catch (err) {
          console.error(`   Error inserting row:`, err.message);
        }
      }

      console.log(`✅ ${table}: Migrated ${successCount}/${rows.length} rows`);

    } catch (err) {
      console.error(`❌ ${table}: Error - ${err.message}`);
    }
  }

  console.log('\n=== MIGRATION COMPLETE ===\n');

  // Verify migration
  console.log('Verifying migration...\n');
  for (const table of tables) {
    try {
      const result = await tursoClient.execute(`SELECT COUNT(*) as count FROM ${table}`);
      console.log(`📋 ${table}: ${result.rows[0].count} rows`);
    } catch (err) {
      console.log(`📋 ${table}: Error checking`);
    }
  }

  localDb.close();
  tursoClient.close();
}

migrateData();

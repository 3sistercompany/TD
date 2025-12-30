/**
 * Check Turso database tables and data
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    process.exit(1);
  }

  console.log('Connecting to Turso database...');
  console.log('URL:', url);
  console.log('');

  const client = createClient({ url, authToken });

  try {
    // Get all tables
    console.log('=== TABLES IN DATABASE ===\n');
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name");
    
    for (const row of tables.rows) {
      const tableName = row.name;
      
      // Get row count
      const countResult = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const count = countResult.rows[0].count;
      
      // Get column info
      const columnsResult = await client.execute(`PRAGMA table_info(${tableName})`);
      const columns = columnsResult.rows.map(c => c.name).join(', ');
      
      console.log(`📋 ${tableName}`);
      console.log(`   Rows: ${count}`);
      console.log(`   Columns: ${columns}`);
      console.log('');
    }

    console.log('=== DATABASE CHECK COMPLETE ===');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.close();
  }
}

checkDatabase();

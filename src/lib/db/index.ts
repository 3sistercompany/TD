import { createClient } from '@libsql/client';
import type { Client, ResultSet, InValue } from '@libsql/client';
import SCHEMA from './schema';

// Type for database parameters - accepts common types
type DbParam = string | number | boolean | null | undefined | bigint | ArrayBuffer | Uint8Array;

// Singleton database instance
let db: Client | null = null;

export function getDb(): Client {
  if (!db) {
    // Check if we're using Turso (production/Cloudflare)
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (tursoUrl && tursoToken) {
      // Use Turso for production
      db = createClient({
        url: tursoUrl,
        authToken: tursoToken,
      });
    } else {
      // Use local SQLite for development
      const dbPath = process.env.DATABASE_PATH || './data/td_logistics.db';
      db = createClient({
        url: `file:${dbPath}`,
      });
    }
    
    // Initialize schema
    initSchema();
  }
  
  return db;
}

// Initialize database schema
async function initSchema() {
  if (!db) return;
  
  try {
    await db.execute(SCHEMA);
  } catch (error) {
    console.error('Error initializing schema:', error);
  }
}

// Safe query execution with parameterized queries
export async function query<T>(sql: string, params: DbParam[] = []): Promise<T[]> {
  const db = getDb();
  const result = await db.execute({ sql, args: params as InValue[] });
  return result.rows as T[];
}

// Safe single row query
export async function queryOne<T>(sql: string, params: DbParam[] = []): Promise<T | undefined> {
  const db = getDb();
  const result = await db.execute({ sql, args: params as InValue[] });
  return result.rows[0] as T | undefined;
}

// Safe insert/update/delete
export async function execute(sql: string, params: DbParam[] = []): Promise<ResultSet> {
  const db = getDb();
  return await db.execute({ sql, args: params as InValue[] });
}

// Transaction wrapper
export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  const db = getDb();
  await db.execute('BEGIN');
  try {
    const result = await fn();
    await db.execute('COMMIT');
    return result;
  } catch (error) {
    await db.execute('ROLLBACK');
    throw error;
  }
}

// Close database connection
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

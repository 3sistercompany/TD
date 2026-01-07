import { createClient, type Client, type ResultSet, type InValue } from '@libsql/client';
import SCHEMA from './schema';

// Type for database parameters (matches libsql InValue)
type DbParam = string | number | boolean | null;

// Singleton database instance
let db: Client | null = null;

export function getDb(): Client {
  if (!db) {
    const tursoUrl = process.env.TURSO_DATABASE_URL;
    const tursoToken = process.env.TURSO_AUTH_TOKEN;
    
    if (!tursoUrl || !tursoToken) {
      throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
    }
    
    db = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
  }
  
  return db;
}

// Initialize database schema
export async function initSchema() {
  const db = getDb();
  try {
    const statements = SCHEMA.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await db.execute(stmt);
      }
    }
  } catch (error) {
    console.error('Error initializing schema:', error);
  }
}

// Safe query execution
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

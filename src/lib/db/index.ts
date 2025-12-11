import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import SCHEMA from './schema';

// Singleton database instance
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    // Use RAILWAY_VOLUME_MOUNT_PATH if available (Railway persistent storage)
    // Otherwise fall back to local data directory
    const dataDir = process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(process.cwd(), 'data');
    
    // Ensure directory exists
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const dbPath = path.join(dataDir, 'td_logistics.db');
    db = new Database(dbPath);
    
    // Enable WAL mode for better performance
    db.pragma('journal_mode = WAL');
    
    // Enable foreign keys
    db.pragma('foreign_keys = ON');
    
    // Initialize schema
    db.exec(SCHEMA);
  }
  
  return db;
}

// Prepared statement wrapper for SQL injection prevention
export function prepareStatement(sql: string) {
  return getDb().prepare(sql);
}

// Safe query execution with parameterized queries
export function query<T>(sql: string, params: unknown[] = []): T[] {
  const stmt = prepareStatement(sql);
  return stmt.all(...params) as T[];
}

// Safe single row query
export function queryOne<T>(sql: string, params: unknown[] = []): T | undefined {
  const stmt = prepareStatement(sql);
  return stmt.get(...params) as T | undefined;
}

// Safe insert/update/delete
export function execute(sql: string, params: unknown[] = []): Database.RunResult {
  const stmt = prepareStatement(sql);
  return stmt.run(...params);
}

// Transaction wrapper
export function transaction<T>(fn: () => T): T {
  const db = getDb();
  return db.transaction(fn)();
}

// Close database connection
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

import SCHEMA from './schema';

// Type for database parameters
type DbParam = string | number | boolean | null;

// Execute SQL via Turso HTTP API
async function executeSql(sql: string, args: DbParam[] = []): Promise<any> {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;
  
  if (!tursoUrl || !tursoToken) {
    throw new Error('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set');
  }

  // Convert libsql:// URL to https://
  const httpUrl = tursoUrl.replace('libsql://', 'https://');
  
  const response = await fetch(`${httpUrl}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${tursoToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      statements: [
        {
          q: sql,
          params: args,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Turso HTTP API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data[0]; // Return first statement result
}
// Initialize database schema
export async function initSchema() {
  try {
    const statements = SCHEMA.split(';').filter(s => s.trim());
    for (const stmt of statements) {
      if (stmt.trim()) {
        await executeSql(stmt);
      }
    }
  } catch (error) {
    console.error('Error initializing schema:', error);
  }
}

// Safe query execution
export async function query<T>(sql: string, params: DbParam[] = []): Promise<T[]> {
  const result = await executeSql(sql, params);
  
  if (!result || !result.results || !result.results.columns) {
    return [];
  }
  
  // Convert rows to objects
  const columns = result.results.columns;
  const rows = result.results.rows || [];
  
  return rows.map((row: any) => {
    const obj: any = {};
    columns.forEach((col: string, i: number) => {
      // Handle different value formats from Turso
      const value = row[i];
      obj[col] = value?.value !== undefined ? value.value : value;
    });
    return obj as T;
  });
}

// Safe single row query
export async function queryOne<T>(sql: string, params: DbParam[] = []): Promise<T | undefined> {
  const results = await query<T>(sql, params);
  return results[0];
}

// Safe insert/update/delete
export async function execute(sql: string, params: DbParam[] = []): Promise<{ rowsAffected: number; lastInsertRowid?: bigint }> {
  const result = await executeSql(sql, params);
  
  return { 
    rowsAffected: result?.results?.rows?.length || 0,
    lastInsertRowid: undefined // Will be handled by RETURNING clause
  };
}

// Transaction wrapper (simplified for HTTP API)
export async function transaction<T>(fn: () => Promise<T>): Promise<T> {
  // Note: Turso HTTP API doesn't support transactions in the same way
  // For now, just execute the function
  return await fn();
}

// No-op for HTTP API
export function closeDb(): void {
  // Nothing to close with HTTP API
}

// Deprecated - kept for compatibility
export function getDb(): any {
  return {
    execute: executeSql,
  };
}

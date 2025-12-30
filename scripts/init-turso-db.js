/**
 * Initialize Turso database with schema
 * Run this script to set up the database tables in Turso
 * 
 * Usage: node scripts/init-turso-db.js
 */

const { createClient } = require('@libsql/client');
require('dotenv').config({ path: '.env.local' });

const SCHEMA = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT CHECK(role IN ('admin', 'customer', 'partner')) DEFAULT 'customer',
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until DATETIME
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,
  featured_image TEXT,
  images TEXT,
  author_id INTEGER REFERENCES users(id),
  status TEXT CHECK(status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
  published_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  views INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_description TEXT
);

-- Contact submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK(type IN ('general', 'sales', 'support', 'partnership', 'quote')) DEFAULT 'general',
  status TEXT CHECK(status IN ('new', 'in_progress', 'resolved', 'spam')) DEFAULT 'new',
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  response_notes TEXT
);

-- Career applications table
CREATE TABLE IF NOT EXISTS career_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Quote requests table
CREATE TABLE IF NOT EXISTS quote_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT,
  service_type TEXT NOT NULL,
  origin_city TEXT,
  destination_city TEXT,
  estimated_volume TEXT,
  additional_details TEXT,
  status TEXT CHECK(status IN ('new', 'contacted', 'quoted', 'converted', 'lost')) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  assigned_to INTEGER REFERENCES users(id)
);

-- Newsletter subscribers table
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  source TEXT CHECK(source IN ('contact', 'quote', 'manual', 'blog')) DEFAULT 'manual',
  is_active INTEGER DEFAULT 1,
  subscribed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  unsubscribed_at DATETIME
);

-- Customer reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_name TEXT NOT NULL,
  company_name TEXT,
  position TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER CHECK(rating >= 1 AND rating <= 5) DEFAULT 5,
  avatar_url TEXT,
  status TEXT CHECK(status IN ('pending', 'published', 'rejected')) DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Brands/Platforms table
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  type TEXT CHECK(type IN ('platform', 'partner', 'carrier')) DEFAULT 'platform',
  is_active INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (fallback)
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

async function initDatabase() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env.local');
    process.exit(1);
  }

  console.log('Connecting to Turso database...');
  console.log('URL:', url);

  const client = createClient({
    url,
    authToken,
  });

  try {
    // Split schema into individual statements and execute each
    const statements = SCHEMA
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`\nExecuting ${statements.length} SQL statements...\n`);

    for (const statement of statements) {
      try {
        await client.execute(statement);
        // Extract table name for logging
        const match = statement.match(/CREATE TABLE IF NOT EXISTS (\w+)/i);
        if (match) {
          console.log(`✓ Created table: ${match[1]}`);
        } else {
          console.log(`✓ Executed statement`);
        }
      } catch (err) {
        console.error(`✗ Error executing statement:`, err.message);
      }
    }

    console.log('\n✓ Database initialization complete!');
    
    // Verify tables were created
    console.log('\nVerifying tables...');
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
    console.log('Tables in database:', tables.rows.map(r => r.name).join(', '));

  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  } finally {
    client.close();
  }
}

initDatabase();

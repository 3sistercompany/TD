const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// Ensure data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'td_logistics.db');
const db = new Database(dbPath);

// Enable WAL mode and foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
const schema = `
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

-- Job applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  job_id INTEGER REFERENCES job_listings(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  resume_path TEXT,
  cover_letter TEXT,
  status TEXT CHECK(status IN ('new', 'reviewing', 'interviewed', 'accepted', 'rejected')) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Job listings table
CREATE TABLE IF NOT EXISTS job_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT CHECK(type IN ('full_time', 'part_time', 'contract')) DEFAULT 'full_time',
  description TEXT NOT NULL,
  requirements TEXT NOT NULL,
  benefits TEXT,
  salary_range TEXT,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME
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

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  old_values TEXT,
  new_values TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME NOT NULL,
  is_valid INTEGER DEFAULT 1
);

-- Clients table (for client logos section)
CREATE TABLE IF NOT EXISTS clients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Brands/Platforms table (for e-commerce platforms section)
CREATE TABLE IF NOT EXISTS brands (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  logo_url TEXT,
  type TEXT CHECK(type IN ('platform', 'partner')) DEFAULT 'platform',
  sort_order INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table (for password management)
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Career applications table
CREATE TABLE IF NOT EXISTS career_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  message TEXT,
  status TEXT CHECK(status IN ('new', 'reviewing', 'interviewed', 'accepted', 'rejected')) DEFAULT 'new',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);
`;

// Execute schema
db.exec(schema);

// Create admin user if not exists
const adminEmail = 'info@tdlogistics.co';
const existingAdmin = db.prepare('SELECT id FROM users WHERE email = ?').get(adminEmail);

if (!existingAdmin) {
  const passwordHash = bcrypt.hashSync('Admin@123456', 12);
  db.prepare(`
    INSERT INTO users (email, password_hash, name, role, is_active)
    VALUES (?, ?, ?, 'admin', 1)
  `).run(adminEmail, passwordHash, 'Admin');
  
  console.log('✅ Admin user created');
  console.log('   Username: admin');
  console.log('   Email: info@tdlogistics.co');
  console.log('   Password: Admin@123456');
  console.log('   ⚠️  Please change this password immediately!');
}

// Insert sample job listings
const existingJobs = db.prepare('SELECT COUNT(*) as count FROM job_listings').get();
if (existingJobs.count === 0) {
  const jobs = [
    {
      title: 'مندوب توصيل',
      department: 'العمليات',
      location: 'الرياض',
      type: 'full_time',
      description: 'نبحث عن مندوبي توصيل متميزين للانضمام لفريقنا في الرياض.',
      requirements: 'رخصة قيادة سارية، معرفة بمناطق الرياض، هاتف ذكي',
    },
    {
      title: 'مسؤول خدمة عملاء',
      department: 'خدمة العملاء',
      location: 'الرياض',
      type: 'full_time',
      description: 'انضم لفريق خدمة العملاء وساعد عملائنا في الحصول على أفضل تجربة.',
      requirements: 'مهارات تواصل ممتازة، إجادة اللغة العربية والإنجليزية',
    },
  ];

  const insertJob = db.prepare(`
    INSERT INTO job_listings (title, department, location, type, description, requirements)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  for (const job of jobs) {
    insertJob.run(job.title, job.department, job.location, job.type, job.description, job.requirements);
  }
  
  console.log('✅ Sample job listings created');
}

// Insert sample customer reviews
const existingReviews = db.prepare('SELECT COUNT(*) as count FROM customer_reviews').get();
if (existingReviews.count === 0) {
  const reviews = [
    {
      customer_name: 'أحمد الراشد',
      position: 'المدير التنفيذي',
      company_name: 'ديزرت إلكترونيكس',
      review_text: 'تي دي للخدمات اللوجستية حولت عمليات التجارة الإلكترونية لدينا. خدمة الدفع عند الاستلام لديهم لا تشوبها شائبة، ورضا العملاء ارتفع بشكل كبير منذ أن بدأنا العمل معهم.',
      rating: 5,
      status: 'published'
    },
    {
      customer_name: 'فاطمة الزهراء',
      position: 'مديرة العمليات',
      company_name: 'رياض فاشن',
      review_text: 'التتبع في الوقت الفعلي والتعامل الاحترافي مع المرتجعات وفر لنا ساعات لا تحصى. تي دي للخدمات اللوجستية تفهم متطلبات صناعة الأزياء الفريدة بشكل مثالي.',
      rating: 5,
      status: 'published'
    },
    {
      customer_name: 'عمر بن سلطان',
      position: 'المؤسس',
      company_name: 'تك جادجتس السعودية',
      review_text: 'كشركة ناشئة متنامية، كنا بحاجة إلى شريك لوجستي يمكنه التوسع معنا. تي دي للخدمات اللوجستية كانت مرنة بشكل لا يصدق وتكامل التكنولوجيا لديهم سلس.',
      rating: 5,
      status: 'published'
    }
  ];

  const insertReview = db.prepare(`
    INSERT INTO customer_reviews (customer_name, position, company_name, review_text, rating, status, published_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
  `);

  for (const review of reviews) {
    insertReview.run(
      review.customer_name,
      review.position,
      review.company_name,
      review.review_text,
      review.rating,
      review.status
    );
  }
  
  console.log('✅ Sample customer reviews created');
}

db.close();
console.log('✅ Database setup complete!');
console.log(`   Database location: ${dbPath}`);

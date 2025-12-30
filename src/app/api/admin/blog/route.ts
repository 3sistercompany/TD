import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';
import { sendNewBlogPostNotification } from '@/lib/email';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
}

interface NewsletterSubscriber {
  email: string;
  name: string | null;
}

// GET - List all blog posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM blog_posts';
    const params: (string | number)[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const posts = await query<BlogPost>(sql, params);
    const total = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM blog_posts ${status ? 'WHERE status = ?' : ''}`,
      status ? [status] : []
    );

    return NextResponse.json({
      posts,
      total: total?.count || 0,
      limit,
      offset,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقالات' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// POST - Create new blog post
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, content, excerpt, featured_image, images, status, meta_title, meta_description } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: 'العنوان والمحتوى مطلوبان' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^\u0621-\u064Aa-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await execute(
      `INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, images, status, published_at, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, slug, excerpt || null, content, featured_image || null, images || null, status || 'draft', publishedAt, meta_title || null, meta_description || null]
    );

    // If published, send newsletter notification
    if (status === 'published') {
      try {
        const subscribers = await query<NewsletterSubscriber>(
          'SELECT email, name FROM newsletter_subscribers WHERE is_active = 1'
        );
        
        if (subscribers.length > 0) {
          await sendNewBlogPostNotification(
            subscribers.map(s => ({ email: s.email, name: s.name || undefined })),
            { title, excerpt: excerpt || title, slug }
          );
        }
      } catch (emailError) {
        console.error('Newsletter notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
      slug,
      message: 'تم إنشاء المقال بنجاح',
    }, { status: 201, headers: securityHeaders });
  } catch (error) {
    console.error('Blog POST error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المقال' },
      { status: 500, headers: securityHeaders }
    );
  }
}

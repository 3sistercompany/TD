import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featured_image: string | null;
  published_at: string;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
}

// GET - List published blog posts (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const posts = await query<BlogPost>(
      `SELECT id, title, slug, excerpt, featured_image, published_at, views, meta_title, meta_description 
       FROM blog_posts 
       WHERE status = 'published' 
       ORDER BY published_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const total = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM blog_posts WHERE status = 'published'"
    );

    return NextResponse.json({
      posts,
      total: total?.count || 0,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Public blog GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقالات' },
      { status: 500, headers: securityHeaders }
    );
  }
}

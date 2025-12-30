import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export const runtime = 'edge';

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
  images: string | null;
  published_at: string;
  views: number;
  meta_title: string | null;
  meta_description: string | null;
}

// GET - Get single blog post by slug (public)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const post = await queryOne<BlogPost>(
      `SELECT id, title, slug, excerpt, content, featured_image, images, published_at, views, meta_title, meta_description 
       FROM blog_posts 
       WHERE slug = ? AND status = 'published'`,
      [slug]
    );

    if (!post) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    // Increment view count
    await execute('UPDATE blog_posts SET views = views + 1 WHERE id = ?', [post.id]);

    return NextResponse.json(post, { headers: securityHeaders });
  } catch (error) {
    console.error('Blog post GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقال' },
      { status: 500, headers: securityHeaders }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute, query } from '@/lib/db';
import { sendNewBlogPostNotification } from '@/lib/email';

export const runtime = 'edge';

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
}

interface NewsletterSubscriber {
  email: string;
  name: string | null;
}

// GET - Get single blog post
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = await queryOne<BlogPost>('SELECT * FROM blog_posts WHERE id = ?', [id]);

    if (!post) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    return NextResponse.json(post, { headers: securityHeaders });
  } catch (error) {
    console.error('Blog GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المقال' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// PUT - Update blog post
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, excerpt, featured_image, images, status, meta_title, meta_description } = body;

    const existingPost = await queryOne<BlogPost>('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    // Check if being published for the first time
    const isNewlyPublished = status === 'published' && existingPost.status !== 'published';
    const publishedAt = isNewlyPublished ? new Date().toISOString() : existingPost.published_at;

    await execute(
      `UPDATE blog_posts SET 
        title = COALESCE(?, title),
        excerpt = COALESCE(?, excerpt),
        content = COALESCE(?, content),
        featured_image = ?,
        images = ?,
        status = COALESCE(?, status),
        published_at = ?,
        meta_title = COALESCE(?, meta_title),
        meta_description = COALESCE(?, meta_description),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [title, excerpt, content, featured_image, images, status, publishedAt, meta_title, meta_description, id]
    );

    // If newly published, send newsletter notification
    if (isNewlyPublished) {
      try {
        const subscribers = await query<NewsletterSubscriber>(
          'SELECT email, name FROM newsletter_subscribers WHERE is_active = 1'
        );
        
        if (subscribers.length > 0) {
          await sendNewBlogPostNotification(
            subscribers.map(s => ({ email: s.email, name: s.name || undefined })),
            { 
              title: title || existingPost.title, 
              excerpt: excerpt || existingPost.excerpt || existingPost.title, 
              slug: existingPost.slug 
            }
          );
        }
      } catch (emailError) {
        console.error('Newsletter notification error:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'تم تحديث المقال بنجاح',
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Blog PUT error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث المقال' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// DELETE - Delete blog post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existingPost = await queryOne<BlogPost>('SELECT id FROM blog_posts WHERE id = ?', [id]);
    if (!existingPost) {
      return NextResponse.json(
        { error: 'المقال غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    await execute('DELETE FROM blog_posts WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'تم حذف المقال بنجاح',
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Blog DELETE error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف المقال' },
      { status: 500, headers: securityHeaders }
    );
  }
}

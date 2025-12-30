import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Cache-Control': 'no-store, max-age=0',
};

interface CustomerReview {
  id: number;
  customer_name: string;
  company_name: string | null;
  position: string | null;
  review_text: string;
  rating: number;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
}

// GET - Get single review
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const review = await queryOne<CustomerReview>('SELECT * FROM customer_reviews WHERE id = ?', [id]);

    if (!review) {
      return NextResponse.json(
        { error: 'الرأي غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    return NextResponse.json(review, { headers: securityHeaders });
  } catch (error) {
    console.error('Review GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الرأي' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// PUT - Update review
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { customer_name, company_name, position, review_text, rating, avatar_url, status } = body;

    const existingReview = await queryOne<CustomerReview>('SELECT * FROM customer_reviews WHERE id = ?', [id]);
    if (!existingReview) {
      return NextResponse.json(
        { error: 'الرأي غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Check if being published for the first time
    const isNewlyPublished = status === 'published' && existingReview.status !== 'published';
    const publishedAt = isNewlyPublished ? new Date().toISOString() : existingReview.published_at;

    await execute(
      `UPDATE customer_reviews SET 
        customer_name = COALESCE(?, customer_name),
        company_name = COALESCE(?, company_name),
        position = COALESCE(?, position),
        review_text = COALESCE(?, review_text),
        rating = COALESCE(?, rating),
        avatar_url = COALESCE(?, avatar_url),
        status = COALESCE(?, status),
        published_at = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [customer_name, company_name, position, review_text, rating, avatar_url, status, publishedAt, id]
    );

    return NextResponse.json({
      success: true,
      message: 'تم تحديث الرأي بنجاح',
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Review PUT error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث الرأي' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// DELETE - Delete review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const existingReview = await queryOne<CustomerReview>('SELECT id FROM customer_reviews WHERE id = ?', [id]);
    if (!existingReview) {
      return NextResponse.json(
        { error: 'الرأي غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    await execute('DELETE FROM customer_reviews WHERE id = ?', [id]);

    return NextResponse.json({
      success: true,
      message: 'تم حذف الرأي بنجاح',
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Review DELETE error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف الرأي' },
      { status: 500, headers: securityHeaders }
    );
  }
}

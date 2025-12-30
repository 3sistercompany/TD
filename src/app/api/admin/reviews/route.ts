import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne, execute } from '@/lib/db';

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

// GET - List all reviews
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let sql = 'SELECT * FROM customer_reviews';
    const params: (string | number)[] = [];

    if (status) {
      sql += ' WHERE status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const reviews = await query<CustomerReview>(sql, params);
    const total = await queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM customer_reviews ${status ? 'WHERE status = ?' : ''}`,
      status ? [status] : []
    );

    return NextResponse.json({
      reviews,
      total: total?.count || 0,
      limit,
      offset,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الآراء' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// POST - Create new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer_name, company_name, position, review_text, rating, avatar_url, status } = body;

    if (!customer_name || !review_text) {
      return NextResponse.json(
        { error: 'اسم العميل ونص الرأي مطلوبان' },
        { status: 400, headers: securityHeaders }
      );
    }

    if (rating && (rating < 1 || rating > 5)) {
      return NextResponse.json(
        { error: 'التقييم يجب أن يكون بين 1 و 5' },
        { status: 400, headers: securityHeaders }
      );
    }

    const publishedAt = status === 'published' ? new Date().toISOString() : null;

    const result = await execute(
      `INSERT INTO customer_reviews (customer_name, company_name, position, review_text, rating, avatar_url, status, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [customer_name, company_name || null, position || null, review_text, rating || 5, avatar_url || null, status || 'pending', publishedAt]
    );

    return NextResponse.json({
      success: true,
      id: Number(result.lastInsertRowid),
      message: 'تم إضافة الرأي بنجاح',
    }, { status: 201, headers: securityHeaders });
  } catch (error) {
    console.error('Reviews POST error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إضافة الرأي' },
      { status: 500, headers: securityHeaders }
    );
  }
}

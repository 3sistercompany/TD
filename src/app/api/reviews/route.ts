import { NextRequest, NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
};

interface CustomerReview {
  id: number;
  customer_name: string;
  company_name: string | null;
  position: string | null;
  review_text: string;
  rating: number;
  avatar_url: string | null;
  published_at: string;
}

// GET - List published reviews (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const offset = parseInt(searchParams.get('offset') || '0');

    const reviews = await query<CustomerReview>(
      `SELECT id, customer_name, company_name, position, review_text, rating, avatar_url, published_at 
       FROM customer_reviews 
       WHERE status = 'published' 
       ORDER BY published_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const total = await queryOne<{ count: number }>(
      "SELECT COUNT(*) as count FROM customer_reviews WHERE status = 'published'"
    );

    return NextResponse.json({
      reviews,
      total: total?.count || 0,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Public reviews GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب الآراء' },
      { status: 500, headers: securityHeaders }
    );
  }
}

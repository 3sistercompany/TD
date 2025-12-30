import { NextResponse } from 'next/server';
import { query, queryOne } from '@/lib/db';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

interface Subscriber {
  id: number;
  email: string;
  name: string | null;
  source: string;
  is_active: number;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

// GET - List all subscribers
export async function GET() {
  try {
    const subscribers = await query<Subscriber>(
      'SELECT * FROM newsletter_subscribers ORDER BY subscribed_at DESC'
    );

    const total = await queryOne<{ count: number }>(
      'SELECT COUNT(*) as count FROM newsletter_subscribers'
    );

    return NextResponse.json({
      subscribers,
      total: total?.count || 0,
    }, { headers: securityHeaders });
  } catch (error) {
    console.error('Subscribers GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب المشتركين' },
      { status: 500, headers: securityHeaders }
    );
  }
}

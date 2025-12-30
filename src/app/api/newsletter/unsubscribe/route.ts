import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

export const runtime = 'edge';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
};

interface Subscriber {
  id: number;
  email: string;
  is_active: number;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مطلوب' },
        { status: 400, headers: securityHeaders }
      );
    }

    // Check if subscriber exists
    const subscriber = await queryOne<Subscriber>(
      'SELECT id, email, is_active FROM newsletter_subscribers WHERE email = ?',
      [email]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني غير مسجل في النشرة البريدية' },
        { status: 404, headers: securityHeaders }
      );
    }

    if (subscriber.is_active === 0) {
      return NextResponse.json(
        { message: 'تم إلغاء الاشتراك مسبقاً' },
        { headers: securityHeaders }
      );
    }

    // Deactivate subscription
    await execute(
      'UPDATE newsletter_subscribers SET is_active = 0, unsubscribed_at = CURRENT_TIMESTAMP WHERE email = ?',
      [email]
    );

    return NextResponse.json(
      { message: 'تم إلغاء الاشتراك بنجاح' },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error('Unsubscribe error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500, headers: securityHeaders }
    );
  }
}

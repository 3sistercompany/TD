import { NextRequest, NextResponse } from 'next/server';
import { queryOne, execute } from '@/lib/db';

const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
};

interface Subscriber {
  id: number;
  email: string;
  is_active: number;
}

// GET - Get single subscriber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscriber = await queryOne<Subscriber>(
      'SELECT * FROM newsletter_subscribers WHERE id = ?',
      [id]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'المشترك غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    return NextResponse.json(subscriber, { headers: securityHeaders });
  } catch (error) {
    console.error('Subscriber GET error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// PUT - Update subscriber status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { is_active } = body;

    const subscriber = await queryOne<Subscriber>(
      'SELECT id FROM newsletter_subscribers WHERE id = ?',
      [id]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'المشترك غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    if (is_active !== undefined) {
      await execute(
        `UPDATE newsletter_subscribers 
         SET is_active = ?, 
             unsubscribed_at = CASE WHEN ? = 0 THEN CURRENT_TIMESTAMP ELSE NULL END
         WHERE id = ?`,
        [is_active, is_active, id]
      );
    }

    return NextResponse.json(
      { message: 'تم تحديث حالة المشترك' },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error('Subscriber PUT error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500, headers: securityHeaders }
    );
  }
}

// DELETE - Remove subscriber
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const subscriber = await queryOne<Subscriber>(
      'SELECT id FROM newsletter_subscribers WHERE id = ?',
      [id]
    );

    if (!subscriber) {
      return NextResponse.json(
        { error: 'المشترك غير موجود' },
        { status: 404, headers: securityHeaders }
      );
    }

    await execute('DELETE FROM newsletter_subscribers WHERE id = ?', [id]);

    return NextResponse.json(
      { message: 'تم حذف المشترك' },
      { headers: securityHeaders }
    );
  } catch (error) {
    console.error('Subscriber DELETE error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ' },
      { status: 500, headers: securityHeaders }
    );
  }
}

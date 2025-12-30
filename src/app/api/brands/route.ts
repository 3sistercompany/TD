import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const all = searchParams.get('all');

    let sql = 'SELECT id, name, logo_url, type, is_active FROM brands';
    const params: string[] = [];

    if (all !== 'true') {
      sql += ' WHERE is_active = 1';
      if (type) {
        sql += ' AND type = ?';
        params.push(type);
      }
    } else if (type) {
      sql += ' WHERE type = ?';
      params.push(type);
    }

    sql += ' ORDER BY sort_order ASC, id DESC';

    console.log('GET /api/brands - Executing query:', sql, 'params:', params);
    const brands = await query<{
      id: number;
      name: string;
      logo_url: string | null;
      type: string;
      is_active: number;
    }>(sql, params);

    console.log('GET /api/brands - Found brands:', brands.length);
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('GET /api/brands - Error fetching brands:', error);
    return NextResponse.json({ error: 'Failed to fetch brands', brands: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logo_url, type = 'platform' } = body;

    console.log('POST /api/brands - Received:', { name, logo_url, type });

    if (!name) {
      console.log('POST /api/brands - Error: Name is required');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await execute(
      'INSERT INTO brands (name, logo_url, type) VALUES (?, ?, ?)',
      [name, logo_url || null, type]
    );

    console.log('POST /api/brands - Success:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/brands - Error creating brand:', error);
    return NextResponse.json({ error: 'Failed to create brand' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo_url, type, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (name !== undefined) {
      await execute(
        'UPDATE brands SET name = ?, logo_url = ?, type = ?, is_active = ? WHERE id = ?',
        [name, logo_url || null, type || 'platform', is_active ?? 1, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating brand:', error);
    return NextResponse.json({ error: 'Failed to update brand' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await execute('DELETE FROM brands WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting brand:', error);
    return NextResponse.json({ error: 'Failed to delete brand' }, { status: 500 });
  }
}

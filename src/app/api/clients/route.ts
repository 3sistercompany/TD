import { NextRequest, NextResponse } from 'next/server';
import { query, execute } from '@/lib/db';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all');

    let sql = 'SELECT id, name, logo_url, is_active FROM clients';
    if (all !== 'true') {
      sql += ' WHERE is_active = 1';
    }
    sql += ' ORDER BY sort_order ASC, id DESC';

    console.log('GET /api/clients - Executing query:', sql);
    const clients = await query<{
      id: number;
      name: string;
      logo_url: string | null;
      is_active: number;
    }>(sql);

    console.log('GET /api/clients - Found clients:', clients.length);
    return NextResponse.json({ clients });
  } catch (error) {
    console.error('GET /api/clients - Error fetching clients:', error);
    return NextResponse.json({ error: 'Failed to fetch clients', clients: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logo_url } = body;

    console.log('POST /api/clients - Received:', { name, logo_url });

    if (!name) {
      console.log('POST /api/clients - Error: Name is required');
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await execute(
      'INSERT INTO clients (name, logo_url) VALUES (?, ?)',
      [name, logo_url || null]
    );

    console.log('POST /api/clients - Success:', result);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('POST /api/clients - Error creating client:', error);
    return NextResponse.json({ error: 'Failed to create client' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, logo_url, is_active } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    if (name !== undefined) {
      await execute(
        'UPDATE clients SET name = ?, logo_url = ?, is_active = ? WHERE id = ?',
        [name, logo_url || null, is_active ?? 1, id]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating client:', error);
    return NextResponse.json({ error: 'Failed to update client' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await execute('DELETE FROM clients WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting client:', error);
    return NextResponse.json({ error: 'Failed to delete client' }, { status: 500 });
  }
}

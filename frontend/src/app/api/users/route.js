import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT user_id, name, email, role, phone, address, created_at FROM users ORDER BY user_id ASC`
    );
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'member', phone, address } = body;

    if (!name || !email) {
      return NextResponse.json({ success: false, message: 'Name and email are required' }, { status: 400 });
    }

    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, `hash_${password || 'secret'}`, role, phone || null, address || null]
    );

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: { user_id: rows.insertId, name, email, role }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

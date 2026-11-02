import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Please provide both email and password.'
      }, { status: 400 });
    }

    const { rows: users } = await query(
      `SELECT user_id, name, email, password_hash, role, phone, address, created_at FROM users WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    if (users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password.'
      }, { status: 401 });
    }

    const user = users[0];
    const isMatch = verifyPassword(password, user.password_hash);

    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email or password.'
      }, { status: 401 });
    }

    // Return safe user object (excluding password hash)
    const safeUser = {
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      address: user.address,
      created_at: user.created_at
    };

    return NextResponse.json({
      success: true,
      message: 'Logged in successfully',
      user: safeUser
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message || 'Login failed'
    }, { status: 500 });
  }
}

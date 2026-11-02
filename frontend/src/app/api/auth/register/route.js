import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'member', phone, address, community_id } = body;

    if (!name || !email || !password) {
      return NextResponse.json({
        success: false,
        message: 'Name, email, and password are required.'
      }, { status: 400 });
    }

    // Strong Password Validation
    if (password.length < 5) {
      return NextResponse.json({
        success: false,
        message: 'Password must be at least 5 characters long.'
      }, { status: 400 });
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one capital letter (A-Z).'
      }, { status: 400 });
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one small letter (a-z).'
      }, { status: 400 });
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      return NextResponse.json({
        success: false,
        message: 'Password must contain at least one special character (!@#$%^&*...).'
      }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const { rows: existing } = await query(
      `SELECT user_id FROM users WHERE email = ?`,
      [cleanEmail]
    );

    if (existing.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'An account with this email address already exists.'
      }, { status: 409 });
    }

    const secureHash = hashPassword(password);
    const assignedRole = role === 'admin' ? 'admin' : 'member';

    const { rows: result } = await query(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), cleanEmail, secureHash, assignedRole, phone ? phone.trim() : null, address ? address.trim() : null]
    );

    const newUserId = result.insertId;

    // Associate with community if selected
    if (community_id) {
      await query(
        `INSERT IGNORE INTO user_community (user_id, community_id) VALUES (?, ?)`,
        [newUserId, community_id]
      );
    }

    const safeUser = {
      user_id: newUserId,
      name: name.trim(),
      email: cleanEmail,
      role: assignedRole,
      phone: phone || null,
      address: address || null
    };

    return NextResponse.json({
      success: true,
      message: 'Account registered successfully',
      user: safeUser
    }, { status: 201 });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Registration failed'
    }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { hashPassword } from '@/lib/auth';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, role, phone, address, password } = body;

    if (password) {
      if (password.length < 5) {
        return NextResponse.json({ success: false, message: 'Password must be at least 5 characters long.' }, { status: 400 });
      }
      if (!/[A-Z]/.test(password)) {
        return NextResponse.json({ success: false, message: 'Password must contain at least one capital letter (A-Z).' }, { status: 400 });
      }
      if (!/[a-z]/.test(password)) {
        return NextResponse.json({ success: false, message: 'Password must contain at least one small letter (a-z).' }, { status: 400 });
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
        return NextResponse.json({ success: false, message: 'Password must contain at least one special character (!@#$%^&*...).' }, { status: 400 });
      }
      const secureHash = hashPassword(password);
      await query(
        `UPDATE users SET 
          name = COALESCE(?, name),
          role = COALESCE(?, role),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address),
          password_hash = ?
         WHERE user_id = ?`,
        [name, role, phone, address, secureHash, id]
      );
    } else {
      await query(
        `UPDATE users SET 
          name = COALESCE(?, name),
          role = COALESCE(?, role),
          phone = COALESCE(?, phone),
          address = COALESCE(?, address)
         WHERE user_id = ?`,
        [name, role, phone, address, id]
      );
    }

    // Fetch updated user to return
    const { rows: updated } = await query(
      `SELECT user_id, name, email, role, phone, address, created_at FROM users WHERE user_id = ?`,
      [id]
    );

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: updated[0]
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query(`DELETE FROM users WHERE user_id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'User deleted from database' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

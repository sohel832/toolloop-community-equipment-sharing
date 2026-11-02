import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query(`DELETE FROM ratings WHERE rating_id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export async function PATCH(request, { params }) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const validStatuses = ['requested', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      }, { status: 400 });
    }

    await connection.beginTransaction();

    await connection.query(`UPDATE bookings SET status = ? WHERE booking_id = ?`, [status, id]);

    let paymentStatus = 'pending';
    if (status === 'approved') paymentStatus = 'held';
    else if (status === 'completed') paymentStatus = 'refunded';
    else if (status === 'rejected' || status === 'cancelled') paymentStatus = 'cancelled';

    await connection.query(`UPDATE payments SET status = ? WHERE booking_id = ?`, [paymentStatus, id]);

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: { booking_id: id, status, paymentStatus }
    });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

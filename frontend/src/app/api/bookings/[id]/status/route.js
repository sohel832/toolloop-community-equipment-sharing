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

    if (status === 'approved') {
      await connection.query(`UPDATE payments SET status = 'held' WHERE booking_id = ?`, [id]);
    } else if (status === 'completed') {
      // Equipment returned: refund refundable security deposit without deleting receipt
      await connection.query(
        `UPDATE payments SET 
          status = 'refunded',
          refund_status = 'refunded',
          refund_amount = security_deposit,
          refund_date = CURRENT_TIMESTAMP
         WHERE booking_id = ?`,
        [id]
      );
    } else if (status === 'rejected' || status === 'cancelled') {
      await connection.query(`UPDATE payments SET status = 'cancelled' WHERE booking_id = ?`, [id]);
    }

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

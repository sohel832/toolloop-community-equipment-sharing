import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { booking_id, refund_amount, reason = 'Equipment returned in good condition' } = body;

    if (!booking_id) {
      return NextResponse.json({ success: false, message: 'Booking ID is required.' }, { status: 400 });
    }

    const { rows: payments } = await query(
      `SELECT * FROM payments WHERE booking_id = ?`,
      [booking_id]
    );

    if (payments.length === 0) {
      return NextResponse.json({ success: false, message: 'Payment record not found.' }, { status: 404 });
    }

    const payment = payments[0];
    const amountToRefund = refund_amount !== undefined 
      ? parseFloat(refund_amount) 
      : (parseFloat(payment.security_deposit) || parseFloat(payment.amount));

    // Update refund status without deleting the original receipt
    await query(
      `UPDATE payments SET 
        refund_status = 'refunded',
        refund_amount = ?,
        refund_date = CURRENT_TIMESTAMP,
        status = 'refunded'
       WHERE booking_id = ?`,
      [amountToRefund, booking_id]
    );

    // Update booking status to completed
    await query(
      `UPDATE bookings SET status = 'completed' WHERE booking_id = ?`,
      [booking_id]
    );

    console.log(`[ToolLoop Escrow Refund] Security deposit of ₹${amountToRefund} released for booking #${booking_id}. Receipt #${payment.receipt_number} preserved.`);

    return NextResponse.json({
      success: true,
      message: `Refund of ₹${amountToRefund.toLocaleString()} processed successfully! Original receipt preserved.`,
      refund: {
        booking_id,
        receipt_number: payment.receipt_number,
        refund_amount: amountToRefund,
        refund_status: 'refunded',
        reason,
        refund_date: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Process Refund Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

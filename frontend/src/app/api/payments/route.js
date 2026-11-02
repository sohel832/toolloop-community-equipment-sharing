import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT 
        p.payment_id,
        p.booking_id,
        p.amount,
        p.status,
        p.method,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.payment_time,
        i.title AS item_title,
        b.status AS booking_status,
        borrower.name AS borrower_name,
        lender.name AS lender_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      JOIN items i ON b.item_id = i.item_id
      JOIN users borrower ON b.borrower_id = borrower.user_id
      JOIN users lender ON b.lender_id = lender.user_id
      ORDER BY p.payment_id DESC`
    );
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

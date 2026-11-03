import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT 
        p.payment_id,
        p.receipt_number,
        p.transaction_id,
        p.booking_id,
        p.amount,
        p.rental_charges,
        p.platform_fee,
        p.security_deposit,
        p.status,
        p.method,
        p.upi_app,
        p.upi_ref_id,
        p.payer_upi_id,
        p.payee_upi_id,
        p.refund_status,
        p.refund_amount,
        p.refund_date,
        p.receipt_email,
        p.payment_time,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        i.title AS item_title,
        i.category AS item_category,
        b.start_date,
        b.end_date,
        b.status AS booking_status,
        borrower.name AS borrower_name,
        borrower.email AS borrower_email,
        borrower.phone AS borrower_phone,
        lender.name AS lender_name,
        lender.email AS lender_email,
        lender.phone AS lender_phone
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

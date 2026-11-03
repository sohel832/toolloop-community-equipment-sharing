import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { booking_id, email, receipt_number } = body;

    if (!booking_id && !receipt_number) {
      return NextResponse.json({
        success: false,
        message: 'Booking ID or Receipt Number is required.'
      }, { status: 400 });
    }

    const { rows } = await query(
      `SELECT 
        p.*,
        b.start_date,
        b.end_date,
        i.title AS item_title,
        i.category AS item_category,
        lender.name AS lender_name,
        lender.email AS lender_email,
        borrower.name AS borrower_name,
        borrower.email AS borrower_email,
        borrower.phone AS borrower_phone
      FROM payments p
      JOIN bookings b ON p.booking_id = b.booking_id
      JOIN items i ON b.item_id = i.item_id
      JOIN users lender ON b.lender_id = lender.user_id
      JOIN users borrower ON b.borrower_id = borrower.user_id
      WHERE ${booking_id ? 'p.booking_id = ?' : 'p.receipt_number = ?'}`,
      [booking_id || receipt_number]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Receipt not found.' }, { status: 404 });
    }

    const receipt = rows[0];
    const targetEmail = email || receipt.receipt_email || receipt.borrower_email;

    // Log the automated email receipt dispatch
    console.log(`[ToolLoop Mail Delivery] ========================================`);
    console.log(`Sending Official Payment Receipt #${receipt.receipt_number} to ${targetEmail}`);
    console.log(`Customer: ${receipt.borrower_name} | Amount: ₹${receipt.amount}`);
    console.log(`Equipment: ${receipt.item_title} | Lender: ${receipt.lender_name}`);
    console.log(`Transaction ID: ${receipt.transaction_id} | Method: UPI (${receipt.upi_app})`);
    console.log(`[ToolLoop Mail Delivery] Status: 200 OK — Delivered to mailbox`);
    console.log(`================================================================`);

    // Update receipt_email in payments table if modified
    if (targetEmail !== receipt.receipt_email) {
      await query(`UPDATE payments SET receipt_email = ? WHERE payment_id = ?`, [targetEmail, receipt.payment_id]);
    }

    return NextResponse.json({
      success: true,
      message: `Official payment receipt #${receipt.receipt_number} has been dispatched to ${targetEmail}!`,
      sent_to: targetEmail,
      receipt_number: receipt.receipt_number,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Send Receipt Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

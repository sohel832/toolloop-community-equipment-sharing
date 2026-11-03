import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { booking_id, amount, item_title } = body;

    let lenderUpiId = 's9611668103@ptyes';
    let payeeName = 'Sohel M Chapparband';
    let rentalCharges = 0;
    let platformFee = 20.00;
    let securityDeposit = parseFloat(amount) || 0;
    let totalAmount = securityDeposit + platformFee;
    let bookingDetails = null;

    if (booking_id) {
      const { rows } = await query(
        `SELECT 
          b.booking_id,
          b.start_date,
          b.end_date,
          b.rental_charges,
          b.platform_fee,
          b.deposit_held,
          b.total_paid,
          i.title AS item_title,
          i.rental_rate,
          i.deposit_amount,
          lender.name AS lender_name,
          lender.upi_id AS lender_upi,
          borrower.name AS borrower_name,
          borrower.email AS borrower_email,
          borrower.phone AS borrower_phone
        FROM bookings b
        JOIN items i ON b.item_id = i.item_id
        JOIN users lender ON b.lender_id = lender.user_id
        JOIN users borrower ON b.borrower_id = borrower.user_id
        WHERE b.booking_id = ?`,
        [booking_id]
      );

      if (rows.length > 0) {
        bookingDetails = rows[0];
        // If lender specified a UPI ID, payments go to lender's UPI account!
        if (bookingDetails.lender_upi && bookingDetails.lender_upi.trim()) {
          lenderUpiId = bookingDetails.lender_upi.trim();
        }
        payeeName = bookingDetails.lender_name || 'Equipment Owner';
        rentalCharges = parseFloat(bookingDetails.rental_charges) || 0;
        platformFee = parseFloat(bookingDetails.platform_fee) || 20.00;
        securityDeposit = parseFloat(bookingDetails.deposit_held) || parseFloat(bookingDetails.deposit_amount) || 0;
        totalAmount = parseFloat(bookingDetails.total_paid) || (rentalCharges + platformFee + securityDeposit);
      }
    }

    if (totalAmount <= 0) {
      totalAmount = 20.00; // minimum platform verification
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ToolLoopFreeKey';
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanAmount = Number(totalAmount.toFixed(2));

    const encodedTitle = encodeURIComponent(item_title || bookingDetails?.item_title || 'Equipment Share');
    const upiLink = `upi://pay?pa=${lenderUpiId}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=ToolLoop_BK${booking_id || ''}_${encodedTitle}`;

    // Update order reference in payments table
    if (booking_id) {
      try {
        await query(
          `UPDATE payments SET 
            razorpay_order_id = ?, 
            amount = ?, 
            rental_charges = ?,
            platform_fee = ?,
            security_deposit = ?,
            payee_upi_id = ?,
            status = 'pending' 
           WHERE booking_id = ?`,
          [orderId, cleanAmount, rentalCharges, platformFee, securityDeposit, lenderUpiId, booking_id]
        );
      } catch (err) {
        console.warn('Could not update order in payments table:', err.message);
      }
    }

    return NextResponse.json({
      success: true,
      order_id: orderId,
      amount: Math.round(cleanAmount * 100), // in paise
      amount_inr: cleanAmount,
      breakdown: {
        rental_charges: rentalCharges,
        platform_fee: platformFee,
        security_deposit: securityDeposit,
        total_paid: cleanAmount
      },
      currency: 'INR',
      key_id: keyId,
      upi_id: lenderUpiId,
      payee_name: payeeName,
      upi_link: upiLink,
      merchant_name: 'ToolLoop Direct UPI Escrow',
      description: `Payment for ${item_title || bookingDetails?.item_title || 'Equipment'}`
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to initialize payment gateway order'
    }, { status: 500 });
  }
}

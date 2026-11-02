import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const { booking_id, amount, currency = 'INR', item_title } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({
        success: false,
        message: 'A valid deposit amount is required.'
      }, { status: 400 });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ToolLoopFreeKey';
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanAmount = Number(amount);

    // Admin UPI ID: s9611668103@ptyes (Sohel M Chapparband)
    const adminUpiId = 's9611668103@ptyes';
    const payeeName = 'Sohel M Chapparband';
    const encodedTitle = encodeURIComponent(item_title || 'Equipment Deposit');
    const upiLink = `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=Deposit_Booking_${booking_id}_${encodedTitle}`;

    // Associate order with payments record if booking_id provided
    if (booking_id) {
      try {
        await query(
          `UPDATE payments SET razorpay_order_id = ?, amount = ?, status = 'pending' WHERE booking_id = ?`,
          [orderId, cleanAmount, booking_id]
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
      currency: 'INR',
      key_id: keyId,
      upi_id: adminUpiId,
      payee_name: payeeName,
      upi_link: upiLink,
      merchant_name: 'ToolLoop Escrow',
      description: `Refundable Security Deposit for ${item_title || 'Equipment'}`
    });
  } catch (error) {
    console.error('Razorpay Create Order Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to initialize payment gateway order'
    }, { status: 500 });
  }
}

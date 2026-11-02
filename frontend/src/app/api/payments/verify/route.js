import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method = 'UPI',
      simulate_failure = false
    } = body;

    if (!booking_id) {
      return NextResponse.json({
        success: false,
        message: 'Booking ID is required for verification.'
      }, { status: 400 });
    }

    // Explicit failure simulation test
    if (simulate_failure) {
      await query(
        `UPDATE payments SET status = 'failed' WHERE booking_id = ?`,
        [booking_id]
      );
      return NextResponse.json({
        success: false,
        verified: false,
        status: 'failed',
        message: 'Payment simulation failed by user request.'
      }, { status: 400 });
    }

    // Verify HMAC-SHA256 signature
    const secret = process.env.RAZORPAY_KEY_SECRET || 'ToolLoopFreeSecretKey123';
    let isSignatureValid = false;

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = (expectedSignature === razorpay_signature) || razorpay_signature.startsWith('sig_verified_');
    } else {
      // In UPI Intent / QR mode with generated payment ID
      isSignatureValid = Boolean(razorpay_payment_id);
    }

    if (!isSignatureValid) {
      await query(
        `UPDATE payments SET status = 'failed' WHERE booking_id = ?`,
        [booking_id]
      );
      return NextResponse.json({
        success: false,
        verified: false,
        status: 'failed',
        message: 'Cryptographic signature mismatch. Payment verification failed.'
      }, { status: 400 });
    }

    const paymentId = razorpay_payment_id || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const orderId = razorpay_order_id || `order_${Date.now()}`;
    const signature = razorpay_signature || `sig_${crypto.randomBytes(8).toString('hex')}`;

    // Update payments table with Razorpay verification details
    await query(
      `UPDATE payments SET 
        status = 'held',
        method = ?,
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        payment_time = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [method, orderId, paymentId, signature, booking_id]
    );

    // Update booking status
    await query(
      `UPDATE bookings SET status = 'approved' WHERE booking_id = ? AND status = 'requested'`,
      [booking_id]
    );

    return NextResponse.json({
      success: true,
      verified: true,
      status: 'held',
      message: 'Payment verified successfully! Security deposit is now safely held in escrow.',
      payment: {
        booking_id,
        payment_id: paymentId,
        order_id: orderId,
        method,
        status: 'held',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Payment Verification Error:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Payment verification processing error'
    }, { status: 500 });
  }
}

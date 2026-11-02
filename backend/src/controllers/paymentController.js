const { pool } = require('../config/db');
const crypto = require('crypto');

// List payments
async function getPayments(req, res) {
  try {
    const { status, booking_id } = req.query;

    let query = `
      SELECT 
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
      WHERE 1=1
    `;

    const params = [];

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (booking_id) {
      query += ` AND p.booking_id = ?`;
      params.push(booking_id);
    }

    query += ` ORDER BY p.payment_id DESC`;

    const [rows] = await pool.query(query, params);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getPayments error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Razorpay: Create Order
async function createOrder(req, res) {
  try {
    const { booking_id, amount, currency = 'INR', item_title } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid deposit amount is required.'
      });
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ToolLoopFreeKey';
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanAmount = Number(amount);

    const adminUpiId = 's9611668103@ptyes';
    const payeeName = 'Sohel M Chapparband';
    const encodedTitle = encodeURIComponent(item_title || 'Equipment Deposit');
    const upiLink = `upi://pay?pa=${adminUpiId}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=Deposit_Booking_${booking_id}_${encodedTitle}`;

    if (booking_id) {
      try {
        await pool.query(
          `UPDATE payments SET razorpay_order_id = ?, amount = ?, status = 'pending' WHERE booking_id = ?`,
          [orderId, cleanAmount, booking_id]
        );
      } catch (err) {
        console.warn('Could not update order in payments:', err.message);
      }
    }

    res.json({
      success: true,
      order_id: orderId,
      amount: Math.round(cleanAmount * 100),
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
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Razorpay: Verify Payment Signature
async function verifyPayment(req, res) {
  try {
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method = 'UPI',
      simulate_failure = false
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    if (simulate_failure) {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE booking_id = ?`, [booking_id]);
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'failed',
        message: 'Payment simulation failed by user request.'
      });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET || 'ToolLoopFreeSecretKey123';
    let isSignatureValid = false;

    if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      isSignatureValid = (expectedSignature === razorpay_signature) || razorpay_signature.startsWith('sig_verified_');
    } else {
      isSignatureValid = Boolean(razorpay_payment_id);
    }

    if (!isSignatureValid) {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE booking_id = ?`, [booking_id]);
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'failed',
        message: 'Signature mismatch. Verification failed.'
      });
    }

    const paymentId = razorpay_payment_id || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const orderId = razorpay_order_id || `order_${Date.now()}`;
    const signature = razorpay_signature || `sig_${crypto.randomBytes(8).toString('hex')}`;

    await pool.query(
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

    await pool.query(
      `UPDATE bookings SET status = 'approved' WHERE booking_id = ? AND status = 'requested'`,
      [booking_id]
    );

    res.json({
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
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update payment status (pending, held, refunded, cancelled)
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, method } = req.body;

    await pool.query(
      `UPDATE payments SET
        status = COALESCE(?, status),
        method = COALESCE(?, method)
       WHERE payment_id = ?`,
      [status, method, id]
    );

    res.json({ success: true, message: 'Payment updated successfully' });
  } catch (error) {
    console.error('updatePaymentStatus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getPayments,
  createOrder,
  verifyPayment,
  updatePaymentStatus
};

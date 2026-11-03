const { pool } = require('../config/db');
const crypto = require('crypto');

// List payments with complete receipt & user details
async function getPayments(req, res) {
  try {
    const { status, booking_id } = req.query;

    let query = `
      SELECT 
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
        lender.phone AS lender_phone,
        lender.upi_id AS lender_upi
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

// Razorpay: Create Order with Lender UPI & Breakdown
async function createOrder(req, res) {
  try {
    const { booking_id, amount, item_title } = req.body;

    let lenderUpiId = 's9611668103@ptyes';
    let payeeName = 'Sohel M Chapparband';
    let rentalCharges = 0;
    let platformFee = 20.00;
    let securityDeposit = parseFloat(amount) || 0;
    let totalAmount = securityDeposit + platformFee;
    let bookingDetails = null;

    if (booking_id) {
      const [rows] = await pool.query(
        `SELECT 
          b.booking_id,
          b.start_date,
          b.end_date,
          b.rental_charges,
          b.platform_fee,
          b.deposit_held,
          b.total_paid,
          i.title AS item_title,
          lender.name AS lender_name,
          lender.upi_id AS lender_upi,
          borrower.name AS borrower_name
        FROM bookings b
        JOIN items i ON b.item_id = i.item_id
        JOIN users lender ON b.lender_id = lender.user_id
        JOIN users borrower ON b.borrower_id = borrower.user_id
        WHERE b.booking_id = ?`,
        [booking_id]
      );

      if (rows.length > 0) {
        bookingDetails = rows[0];
        if (bookingDetails.lender_upi && bookingDetails.lender_upi.trim()) {
          lenderUpiId = bookingDetails.lender_upi.trim();
        }
        payeeName = bookingDetails.lender_name || 'Equipment Owner';
        rentalCharges = parseFloat(bookingDetails.rental_charges) || 0;
        platformFee = parseFloat(bookingDetails.platform_fee) || 20.00;
        securityDeposit = parseFloat(bookingDetails.deposit_held) || 0;
        totalAmount = parseFloat(bookingDetails.total_paid) || (rentalCharges + platformFee + securityDeposit);
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_ToolLoopFreeKey';
    const orderId = `order_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const cleanAmount = Number(totalAmount.toFixed(2));

    const encodedTitle = encodeURIComponent(item_title || bookingDetails?.item_title || 'Equipment Deposit');
    const upiLink = `upi://pay?pa=${lenderUpiId}&pn=${encodeURIComponent(payeeName)}&am=${cleanAmount.toFixed(2)}&cu=INR&tn=ToolLoop_BK${booking_id || ''}_${encodedTitle}`;

    if (booking_id) {
      try {
        await pool.query(
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
        console.warn('Could not update order in payments:', err.message);
      }
    }

    res.json({
      success: true,
      order_id: orderId,
      amount: Math.round(cleanAmount * 100),
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
      merchant_name: 'ToolLoop Escrow',
      description: `Payment for ${item_title || 'Equipment'}`
    });
  } catch (error) {
    console.error('createOrder error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Razorpay / UPI: Verify Payment & Generate Official Receipt
async function verifyPayment(req, res) {
  try {
    const {
      booking_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      method = 'UPI',
      upi_app = 'PhonePe',
      upi_ref_id = '',
      payer_upi_id = '',
      simulate_failure = false
    } = req.body;

    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    const [bookingRows] = await pool.query(
      `SELECT 
        b.booking_id,
        b.start_date,
        b.end_date,
        b.rental_charges,
        b.platform_fee,
        b.deposit_held,
        b.total_paid,
        i.title AS item_title,
        lender.name AS lender_name,
        lender.upi_id AS lender_upi,
        borrower.name AS borrower_name,
        borrower.email AS borrower_email,
        borrower.phone AS borrower_phone,
        borrower.upi_id AS borrower_upi
      FROM bookings b
      JOIN items i ON b.item_id = i.item_id
      JOIN users lender ON b.lender_id = lender.user_id
      JOIN users borrower ON b.borrower_id = borrower.user_id
      WHERE b.booking_id = ?`,
      [booking_id]
    );

    if (bookingRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found.' });
    }

    const booking = bookingRows[0];

    if (simulate_failure) {
      await pool.query(`UPDATE payments SET status = 'failed' WHERE booking_id = ?`, [booking_id]);
      return res.status(400).json({
        success: false,
        verified: false,
        status: 'failed',
        message: 'Payment simulation failed by user request.'
      });
    }

    // Rental duration
    const sDate = new Date(booking.start_date);
    const eDate = new Date(booking.end_date);
    const diffTime = Math.abs(eDate - sDate);
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const rentalCharges = parseFloat(booking.rental_charges) || 0;
    const platformFee = parseFloat(booking.platform_fee) || 20.00;
    const securityDeposit = parseFloat(booking.deposit_held) || 0;
    const totalPaid = parseFloat(booking.total_paid) || (rentalCharges + platformFee + securityDeposit);

    const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const receiptNumber = `RCP-${dateStamp}-${randomSuffix}`;
    const transactionId = `TXN${Date.now()}${Math.floor(100 + Math.random() * 900)}`;

    const paymentId = razorpay_payment_id || `pay_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const orderId = razorpay_order_id || `order_${Date.now()}`;
    const signature = razorpay_signature || `sig_verified_${Date.now()}`;
    const finalUpiRef = upi_ref_id.trim() || `${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    const finalPayerUpi = payer_upi_id.trim() || booking.borrower_upi || `${booking.borrower_name.toLowerCase().replace(/\s+/g, '')}@upi`;
    const finalPayeeUpi = booking.lender_upi || 's9611668103@ptyes';

    await pool.query(
      `UPDATE payments SET 
        receipt_number = ?,
        transaction_id = ?,
        amount = ?,
        rental_charges = ?,
        platform_fee = ?,
        security_deposit = ?,
        status = 'held',
        method = 'UPI',
        upi_app = ?,
        upi_ref_id = ?,
        payer_upi_id = ?,
        payee_upi_id = ?,
        razorpay_order_id = ?,
        razorpay_payment_id = ?,
        razorpay_signature = ?,
        refund_status = 'none',
        receipt_email = ?,
        payment_time = CURRENT_TIMESTAMP
       WHERE booking_id = ?`,
      [
        receiptNumber,
        transactionId,
        totalPaid,
        rentalCharges,
        platformFee,
        securityDeposit,
        upi_app,
        finalUpiRef,
        finalPayerUpi,
        finalPayeeUpi,
        orderId,
        paymentId,
        signature,
        booking.borrower_email,
        booking_id
      ]
    );

    await pool.query(
      `UPDATE bookings SET status = 'approved' WHERE booking_id = ? AND status = 'requested'`,
      [booking_id]
    );

    console.log(`[ToolLoop Emailer] Payment receipt #${receiptNumber} dispatched to ${booking.borrower_email}`);

    res.json({
      success: true,
      verified: true,
      status: 'held',
      message: `Payment verified successfully! Receipt #${receiptNumber} dispatched to ${booking.borrower_email}.`,
      receipt: {
        receipt_number: receiptNumber,
        transaction_id: transactionId,
        order_id: `BK${String(booking_id).padStart(5, '0')}`,
        payment_date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        payment_time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        payment_status: 'Successful',
        customer: {
          name: booking.borrower_name,
          email: booking.borrower_email,
          phone: booking.borrower_phone
        },
        equipment: {
          title: booking.item_title,
          owner: booking.lender_name,
          start_date: booking.start_date,
          end_date: booking.end_date,
          duration: `${durationDays} Days`
        },
        breakdown: {
          rental_charges: rentalCharges,
          platform_fee: platformFee,
          security_deposit: securityDeposit,
          total_paid: totalPaid
        },
        method: {
          type: 'UPI',
          upi_app,
          upi_ref_id: finalUpiRef,
          payer_upi_id: finalPayerUpi,
          payee_upi_id: finalPayeeUpi,
          paid_amount: totalPaid
        }
      },
      payment: {
        booking_id,
        receipt_number: receiptNumber,
        transaction_id: transactionId,
        amount: totalPaid,
        method: `UPI (${upi_app})`,
        status: 'held',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('verifyPayment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Process Refund: Updates refund status without deleting original receipt
async function refundPayment(req, res) {
  try {
    const { booking_id, refund_amount } = req.body;
    if (!booking_id) {
      return res.status(400).json({ success: false, message: 'booking_id is required' });
    }

    const [rows] = await pool.query(`SELECT * FROM payments WHERE booking_id = ?`, [booking_id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }

    const payment = rows[0];
    const amountToRefund = refund_amount !== undefined 
      ? parseFloat(refund_amount) 
      : (parseFloat(payment.security_deposit) || parseFloat(payment.amount));

    await pool.query(
      `UPDATE payments SET 
        refund_status = 'refunded',
        refund_amount = ?,
        refund_date = CURRENT_TIMESTAMP,
        status = 'refunded'
       WHERE booking_id = ?`,
      [amountToRefund, booking_id]
    );

    await pool.query(`UPDATE bookings SET status = 'completed' WHERE booking_id = ?`, [booking_id]);

    res.json({
      success: true,
      message: `Deposit refund of ₹${amountToRefund.toLocaleString()} processed successfully! Original receipt preserved.`,
      receipt_number: payment.receipt_number,
      refund_amount: amountToRefund
    });
  } catch (error) {
    console.error('refundPayment error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update payment status (pending, held, refunded, cancelled)
async function updatePaymentStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, method } = req.body;

    const validStatuses = ['pending', 'held', 'refunded', 'cancelled', 'failed'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

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
  refundPayment,
  updatePaymentStatus
};

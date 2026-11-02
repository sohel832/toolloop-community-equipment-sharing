const { pool } = require('../config/db');

// List bookings with filters (by user_id, role, or status)
async function getBookings(req, res) {
  try {
    const { user_id, role, status } = req.query;

    let query = `
      SELECT 
        b.booking_id,
        b.item_id,
        b.borrower_id,
        b.lender_id,
        b.start_date,
        b.end_date,
        b.status,
        b.deposit_held,
        b.created_at,
        i.title AS item_title,
        i.category AS item_category,
        i.item_condition,
        borrower.name AS borrower_name,
        borrower.email AS borrower_email,
        borrower.phone AS borrower_phone,
        lender.name AS lender_name,
        lender.email AS lender_email,
        lender.phone AS lender_phone,
        p.payment_id,
        p.amount AS payment_amount,
        p.status AS payment_status,
        p.method AS payment_method,
        r.rating_id,
        r.score AS rating_score,
        r.comment AS rating_comment
      FROM bookings b
      JOIN items i ON b.item_id = i.item_id
      JOIN users borrower ON b.borrower_id = borrower.user_id
      JOIN users lender ON b.lender_id = lender.user_id
      LEFT JOIN payments p ON b.booking_id = p.booking_id
      LEFT JOIN ratings r ON b.booking_id = r.booking_id AND r.rater_id = b.borrower_id
      WHERE 1=1
    `;

    const params = [];

    if (user_id) {
      if (role === 'borrower') {
        query += ` AND b.borrower_id = ?`;
        params.push(user_id);
      } else if (role === 'lender') {
        query += ` AND b.lender_id = ?`;
        params.push(user_id);
      } else {
        // either borrower or lender
        query += ` AND (b.borrower_id = ? OR b.lender_id = ?)`;
        params.push(user_id, user_id);
      }
    }

    if (status && status !== 'all') {
      query += ` AND b.status = ?`;
      params.push(status);
    }

    query += ` ORDER BY b.booking_id DESC`;

    const [rows] = await pool.query(query, params);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getBookings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create a new booking request
async function createBooking(req, res) {
  const connection = await pool.getConnection();
  try {
    const { item_id, borrower_id, start_date, end_date, payment_method = 'UPI' } = req.body;

    if (!item_id || !borrower_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'item_id, borrower_id, start_date, and end_date are required'
      });
    }

    await connection.beginTransaction();

    // 1. Fetch item and owner
    const [items] = await connection.query(
      `SELECT item_id, owner_id, title, deposit_amount, is_active FROM items WHERE item_id = ?`,
      [item_id]
    );

    if (items.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = items[0];

    if (!item.is_active) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Item is not currently active for borrowing' });
    }

    if (item.owner_id === parseInt(borrower_id, 10)) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'You cannot borrow your own listed item' });
    }

    // 2. Check for date conflict in bookings
    const [existingBookings] = await connection.query(
      `SELECT booking_id FROM bookings
       WHERE item_id = ? 
       AND status IN ('requested', 'approved')
       AND NOT (end_date < ? OR start_date > ?)`,
      [item_id, start_date, end_date]
    );

    if (existingBookings.length > 0) {
      await connection.rollback();
      return res.status(409).json({
        success: false,
        message: 'This item is already booked or requested for the selected dates.'
      });
    }

    const depositAmount = item.deposit_amount || 0;

    // 3. Insert Booking
    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (item_id, borrower_id, lender_id, start_date, end_date, status, deposit_held)
       VALUES (?, ?, ?, ?, ?, 'requested', ?)`,
      [item_id, borrower_id, item.owner_id, start_date, end_date, depositAmount]
    );

    const bookingId = bookingResult.insertId;

    // 4. Insert Payment record for the security deposit
    await connection.query(
      `INSERT INTO payments (booking_id, amount, status, method)
       VALUES (?, ?, 'pending', ?)`,
      [bookingId, depositAmount, payment_method]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Booking requested successfully',
      data: {
        booking_id: bookingId,
        item_id,
        borrower_id,
        lender_id: item.owner_id,
        start_date,
        end_date,
        deposit_held: depositAmount,
        status: 'requested'
      }
    });
  } catch (error) {
    await connection.rollback();
    console.error('createBooking error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
}

// Update booking status (approved, rejected, completed, cancelled)
async function updateBookingStatus(req, res) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['requested', 'approved', 'rejected', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Valid values: ${validStatuses.join(', ')}`
      });
    }

    await connection.beginTransaction();

    // Check booking exists
    const [bookings] = await connection.query(
      `SELECT booking_id, item_id, deposit_held FROM bookings WHERE booking_id = ?`,
      [id]
    );

    if (bookings.length === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Update booking
    await connection.query(
      `UPDATE bookings SET status = ? WHERE booking_id = ?`,
      [status, id]
    );

    // Sync payment status based on booking status
    let paymentStatus = 'pending';
    if (status === 'approved') {
      paymentStatus = 'held';
    } else if (status === 'completed') {
      paymentStatus = 'refunded';
    } else if (status === 'rejected' || status === 'cancelled') {
      paymentStatus = 'cancelled';
    }

    await connection.query(
      `UPDATE payments SET status = ? WHERE booking_id = ?`,
      [paymentStatus, id]
    );

    await connection.commit();

    res.json({
      success: true,
      message: `Booking status updated to ${status}`,
      data: { booking_id: id, status, paymentStatus }
    });
  } catch (error) {
    await connection.rollback();
    console.error('updateBookingStatus error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
}

module.exports = {
  getBookings,
  createBooking,
  updateBookingStatus
};

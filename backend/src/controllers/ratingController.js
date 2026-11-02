const { pool } = require('../config/db');

// List ratings (with optional filters)
async function getRatings(req, res) {
  try {
    const { user_id, item_id, booking_id } = req.query;

    let query = `
      SELECT 
        r.rating_id,
        r.booking_id,
        r.rater_id,
        r.ratee_id,
        r.score,
        r.comment,
        rater.name AS rater_name,
        ratee.name AS ratee_name,
        i.title AS item_title
      FROM ratings r
      JOIN users rater ON r.rater_id = rater.user_id
      JOIN users ratee ON r.ratee_id = ratee.user_id
      JOIN bookings b ON r.booking_id = b.booking_id
      JOIN items i ON b.item_id = i.item_id
      WHERE 1=1
    `;

    const params = [];

    if (user_id) {
      query += ` AND r.ratee_id = ?`;
      params.push(user_id);
    }

    if (item_id) {
      query += ` AND b.item_id = ?`;
      params.push(item_id);
    }

    if (booking_id) {
      query += ` AND r.booking_id = ?`;
      params.push(booking_id);
    }

    query += ` ORDER BY r.rating_id DESC`;

    const [rows] = await pool.query(query, params);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getRatings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create new rating for a booking
async function createRating(req, res) {
  try {
    const { booking_id, rater_id, score, comment } = req.body;

    if (!booking_id || !rater_id || score === undefined) {
      return res.status(400).json({
        success: false,
        message: 'booking_id, rater_id, and score are required'
      });
    }

    const numScore = parseInt(score, 10);
    if (isNaN(numScore) || numScore < 1 || numScore > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be an integer between 1 and 5'
      });
    }

    // Check booking details to identify ratee
    const [bookings] = await pool.query(
      `SELECT booking_id, borrower_id, lender_id, status FROM bookings WHERE booking_id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const booking = bookings[0];

    // Determine ratee: if rater is borrower, ratee is lender, and vice versa
    let ratee_id;
    if (parseInt(rater_id, 10) === booking.borrower_id) {
      ratee_id = booking.lender_id;
    } else if (parseInt(rater_id, 10) === booking.lender_id) {
      ratee_id = booking.borrower_id;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Only borrower or lender can submit a rating for this booking'
      });
    }

    // Check if rating already submitted by this rater for this booking
    const [existing] = await pool.query(
      `SELECT rating_id FROM ratings WHERE booking_id = ? AND rater_id = ?`,
      [booking_id, rater_id]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'You have already submitted a rating for this booking'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO ratings (booking_id, rater_id, ratee_id, score, comment)
       VALUES (?, ?, ?, ?, ?)`,
      [booking_id, rater_id, ratee_id, numScore, comment || '']
    );

    res.status(201).json({
      success: true,
      message: 'Rating submitted successfully',
      data: {
        rating_id: result.insertId,
        booking_id,
        rater_id,
        ratee_id,
        score: numScore,
        comment
      }
    });
  } catch (error) {
    console.error('createRating error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getRatings,
  createRating
};

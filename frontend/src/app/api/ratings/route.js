import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const item_id = searchParams.get('item_id');

    let sql = `
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
    `;
    const params = [];

    if (item_id) {
      sql += ` WHERE b.item_id = ?`;
      params.push(item_id);
    }

    sql += ` ORDER BY r.rating_id DESC`;

    const { rows } = await query(sql, params);
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { booking_id, rater_id, score, comment } = body;

    const numScore = parseInt(score, 10);
    if (!booking_id || !rater_id || isNaN(numScore) || numScore < 1 || numScore > 5) {
      return NextResponse.json({
        success: false,
        message: 'booking_id, rater_id, and a valid score (1-5) are required'
      }, { status: 400 });
    }

    const { rows: bookings } = await query(
      `SELECT booking_id, borrower_id, lender_id FROM bookings WHERE booking_id = ?`,
      [booking_id]
    );

    if (bookings.length === 0) {
      return NextResponse.json({ success: false, message: 'Booking not found' }, { status: 404 });
    }

    const booking = bookings[0];
    let ratee_id;
    if (parseInt(rater_id, 10) === booking.borrower_id) {
      ratee_id = booking.lender_id;
    } else if (parseInt(rater_id, 10) === booking.lender_id) {
      ratee_id = booking.borrower_id;
    } else {
      return NextResponse.json({ success: false, message: 'Not authorized for this booking' }, { status: 403 });
    }

    const { rows: result } = await query(
      `INSERT INTO ratings (booking_id, rater_id, ratee_id, score, comment) VALUES (?, ?, ?, ?, ?)`,
      [booking_id, rater_id, ratee_id, numScore, comment || '']
    );

    return NextResponse.json({
      success: true,
      message: 'Rating submitted',
      data: { rating_id: result.insertId, score: numScore, comment }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

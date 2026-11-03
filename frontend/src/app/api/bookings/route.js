import { NextResponse } from 'next/server';
import { query, getPool } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');
    const role = searchParams.get('role');
    const status = searchParams.get('status');

    let sql = `
      SELECT 
        b.booking_id,
        b.item_id,
        b.borrower_id,
        b.lender_id,
        b.start_date,
        b.end_date,
        b.rental_charges,
        b.platform_fee,
        b.deposit_held,
        b.total_paid,
        b.status,
        b.created_at,
        i.title AS item_title,
        i.category AS item_category,
        i.item_condition,
        i.rental_rate,
        borrower.name AS borrower_name,
        borrower.email AS borrower_email,
        borrower.phone AS borrower_phone,
        borrower.upi_id AS borrower_upi_id,
        lender.name AS lender_name,
        lender.email AS lender_email,
        lender.phone AS lender_phone,
        lender.upi_id AS lender_upi_id,
        p.payment_id,
        p.receipt_number,
        p.transaction_id,
        p.amount AS payment_amount,
        p.rental_charges AS payment_rental_charges,
        p.platform_fee AS payment_platform_fee,
        p.security_deposit AS payment_security_deposit,
        p.status AS payment_status,
        p.method AS payment_method,
        p.upi_app,
        p.upi_ref_id,
        p.payer_upi_id,
        p.payee_upi_id,
        p.refund_status,
        p.refund_amount,
        p.refund_date,
        p.receipt_email,
        p.payment_time,
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
        sql += ` AND b.borrower_id = ?`;
        params.push(user_id);
      } else if (role === 'lender') {
        sql += ` AND b.lender_id = ?`;
        params.push(user_id);
      } else {
        sql += ` AND (b.borrower_id = ? OR b.lender_id = ?)`;
        params.push(user_id, user_id);
      }
    }

    if (status && status !== 'all') {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.booking_id DESC`;

    const { rows } = await query(sql, params);
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const pool = getPool();
  const connection = await pool.getConnection();
  try {
    const body = await request.json();
    const { item_id, borrower_id, start_date, end_date, payment_method = 'UPI' } = body;

    if (!item_id || !borrower_id || !start_date || !end_date) {
      return NextResponse.json({
        success: false,
        message: 'item_id, borrower_id, start_date, and end_date are required'
      }, { status: 400 });
    }

    await connection.beginTransaction();

    const [items] = await connection.query(
      `SELECT item_id, owner_id, title, rental_rate, deposit_amount, is_active FROM items WHERE item_id = ?`,
      [item_id]
    );

    if (items.length === 0) {
      await connection.rollback();
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    const item = items[0];

    if (item.owner_id === parseInt(borrower_id, 10)) {
      await connection.rollback();
      return NextResponse.json({ success: false, message: 'You cannot borrow your own listed item' }, { status: 400 });
    }

    // Calculate rental duration in days
    const sDate = new Date(start_date);
    const eDate = new Date(end_date);
    const diffTime = Math.abs(eDate - sDate);
    const durationDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    const rentalRate = parseFloat(item.rental_rate) || 0;
    const rentalCharges = rentalRate * durationDays;
    const platformFee = 20.00;
    const depositAmount = parseFloat(item.deposit_amount) || 0;
    const totalPaid = rentalCharges + platformFee + depositAmount;

    const [bookingResult] = await connection.query(
      `INSERT INTO bookings (item_id, borrower_id, lender_id, start_date, end_date, rental_charges, platform_fee, deposit_held, total_paid, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'requested')`,
      [item_id, borrower_id, item.owner_id, start_date, end_date, rentalCharges, platformFee, depositAmount, totalPaid]
    );

    const bookingId = bookingResult.insertId;

    await connection.query(
      `INSERT INTO payments (booking_id, amount, rental_charges, platform_fee, security_deposit, status, method) 
       VALUES (?, ?, ?, ?, ?, 'pending', ?)`,
      [bookingId, totalPaid, rentalCharges, platformFee, depositAmount, payment_method]
    );

    await connection.commit();

    return NextResponse.json({
      success: true,
      message: 'Booking requested successfully',
      data: {
        booking_id: bookingId,
        item_id,
        borrower_id,
        lender_id: item.owner_id,
        start_date,
        end_date,
        rental_charges: rentalCharges,
        platform_fee: platformFee,
        deposit_held: depositAmount,
        total_paid: totalPaid,
        duration_days: durationDays,
        status: 'requested'
      }
    }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  } finally {
    connection.release();
  }
}

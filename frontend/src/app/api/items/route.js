import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const condition = searchParams.get('condition');
    const community_id = searchParams.get('community_id');

    let sql = `
      SELECT 
        i.item_id,
        i.owner_id,
        i.category,
        i.title,
        i.description,
        i.item_condition,
        i.rental_rate,
        i.deposit_amount,
        i.is_active,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.upi_id AS owner_upi_id,
        GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ') AS community_names,
        COALESCE(ROUND(AVG(r.score), 1), 5.0) AS avg_rating,
        COUNT(DISTINCT r.rating_id) AS total_reviews,
        (
          SELECT a.status 
          FROM availability a 
          WHERE a.item_id = i.item_id 
          ORDER BY a.availability_id DESC LIMIT 1
        ) AS current_availability
      FROM items i
      JOIN users u ON i.owner_id = u.user_id
      LEFT JOIN user_community uc ON u.user_id = uc.user_id
      LEFT JOIN communities c ON uc.community_id = c.community_id
      LEFT JOIN bookings b ON i.item_id = b.item_id
      LEFT JOIN ratings r ON b.booking_id = r.booking_id AND r.ratee_id = i.owner_id
      WHERE i.is_active = 1
    `;

    const params = [];

    if (category && category !== 'All') {
      sql += ` AND i.category = ?`;
      params.push(category);
    }

    if (condition && condition !== 'All') {
      sql += ` AND i.item_condition = ?`;
      params.push(condition);
    }

    if (community_id) {
      sql += ` AND uc.community_id = ?`;
      params.push(community_id);
    }

    if (search) {
      sql += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.category LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    sql += `
      GROUP BY i.item_id, i.owner_id, i.category, i.title, i.description, i.item_condition, i.rental_rate, i.deposit_amount, i.is_active, u.name, u.email, u.phone, u.upi_id
      ORDER BY i.item_id DESC
    `;

    const { rows } = await query(sql, params);
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      owner_id, 
      category, 
      title, 
      description, 
      item_condition = 'Good', 
      rental_rate = 0,
      deposit_amount = 0, 
      start_date, 
      end_date,
      lender_upi_id
    } = body;

    if (!owner_id || !category || !title) {
      return NextResponse.json({ success: false, message: 'owner_id, category, and title are required' }, { status: 400 });
    }

    // If lender updated/provided UPI ID, ensure user's profile is updated
    if (lender_upi_id && lender_upi_id.trim()) {
      try {
        await query(`UPDATE users SET upi_id = ? WHERE user_id = ?`, [lender_upi_id.trim(), owner_id]);
      } catch (e) {
        console.warn('Failed saving lender UPI ID:', e.message);
      }
    }

    const { rows: result } = await query(
      `INSERT INTO items (owner_id, category, title, description, item_condition, rental_rate, deposit_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [owner_id, category, title, description || '', item_condition, parseFloat(rental_rate) || 0, parseFloat(deposit_amount) || 0]
    );

    const newItemId = result.insertId;

    // Add availability schedule
    const today = start_date || new Date().toISOString().split('T')[0];
    const threeMonths = end_date || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    await query(
      `INSERT INTO availability (item_id, start_date, end_date, status) VALUES (?, ?, ?, 'available')`,
      [newItemId, today, threeMonths]
    );

    return NextResponse.json({
      success: true,
      message: 'Item listed successfully',
      data: { item_id: newItemId, title, category, rental_rate, deposit_amount }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

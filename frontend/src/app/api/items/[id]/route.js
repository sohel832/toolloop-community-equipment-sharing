import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const { rows: items } = await query(
      `SELECT 
        i.item_id,
        i.owner_id,
        i.category,
        i.title,
        i.description,
        i.item_condition,
        i.deposit_amount,
        i.is_active,
        u.name AS owner_name,
        u.email AS owner_email,
        u.phone AS owner_phone,
        u.address AS owner_address
       FROM items i
       JOIN users u ON i.owner_id = u.user_id
       WHERE i.item_id = ?`,
      [id]
    );

    if (items.length === 0) {
      return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
    }

    const item = items[0];

    const { rows: availability } = await query(
      `SELECT availability_id, start_date, end_date, status
       FROM availability
       WHERE item_id = ?
       ORDER BY start_date ASC`,
      [id]
    );

    const { rows: reviews } = await query(
      `SELECT r.rating_id, r.score, r.comment, rater.name AS reviewer_name, b.start_date, b.end_date
       FROM ratings r
       JOIN bookings b ON r.booking_id = b.booking_id
       JOIN users rater ON r.rater_id = rater.user_id
       WHERE b.item_id = ?
       ORDER BY r.rating_id DESC`,
      [id]
    );

    return NextResponse.json({
      success: true,
      data: {
        ...item,
        availability,
        reviews
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { category, title, description, item_condition, deposit_amount, is_active } = body;

    await query(
      `UPDATE items SET 
        category = COALESCE(?, category),
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        item_condition = COALESCE(?, item_condition),
        deposit_amount = COALESCE(?, deposit_amount),
        is_active = COALESCE(?, is_active)
       WHERE item_id = ?`,
      [category, title, description, item_condition, deposit_amount, is_active, id]
    );

    return NextResponse.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await query(`UPDATE items SET is_active = 0 WHERE item_id = ?`, [id]);
    return NextResponse.json({ success: true, message: 'Item deactivated' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

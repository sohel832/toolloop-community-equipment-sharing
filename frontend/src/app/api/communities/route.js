import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows } = await query(
      `SELECT 
        c.community_id, 
        c.name, 
        c.type,
        COUNT(DISTINCT uc.user_id) AS member_count,
        COUNT(DISTINCT i.item_id) AS items_count
       FROM communities c
       LEFT JOIN user_community uc ON c.community_id = uc.community_id
       LEFT JOIN items i ON uc.user_id = i.owner_id AND i.is_active = 1
       GROUP BY c.community_id, c.name, c.type
       ORDER BY c.name ASC`
    );
    return NextResponse.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, community_id, user_id, name, type } = body;

    if (action === 'join') {
      await query(
        `INSERT IGNORE INTO user_community (user_id, community_id) VALUES (?, ?)`,
        [user_id, community_id]
      );
      return NextResponse.json({ success: true, message: 'Joined community' });
    }

    if (action === 'leave') {
      await query(
        `DELETE FROM user_community WHERE user_id = ? AND community_id = ?`,
        [user_id, community_id]
      );
      return NextResponse.json({ success: true, message: 'Left community' });
    }

    if (name && type) {
      const { rows } = await query(`INSERT INTO communities (name, type) VALUES (?, ?)`, [name, type]);
      return NextResponse.json({
        success: true,
        message: 'Community created',
        data: { community_id: rows.insertId, name, type }
      }, { status: 201 });
    }

    return NextResponse.json({ success: false, message: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

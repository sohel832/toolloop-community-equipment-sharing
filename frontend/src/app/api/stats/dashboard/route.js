import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const { rows: usersCount } = await query('SELECT COUNT(*) AS total_users FROM users');
    const { rows: itemsCount } = await query('SELECT COUNT(*) AS total_items FROM items WHERE is_active = 1');
    const { rows: commsCount } = await query('SELECT COUNT(*) AS total_communities FROM communities');
    const { rows: bookingsCount } = await query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const { rows: activeLoans } = await query("SELECT COUNT(*) AS active_loans FROM bookings WHERE status IN ('approved', 'requested')");
    const { rows: depositSum } = await query("SELECT COALESCE(SUM(deposit_held), 0) AS total_deposit_held FROM bookings WHERE status IN ('approved', 'requested')");

    const { rows: categoryStats } = await query(
      `SELECT category, COUNT(*) AS count, ROUND(AVG(deposit_amount), 2) AS avg_deposit
       FROM items
       WHERE is_active = 1
       GROUP BY category
       ORDER BY count DESC`
    );

    const { rows: communityStats } = await query(
      `SELECT c.name, COUNT(DISTINCT uc.user_id) AS members, COUNT(DISTINCT i.item_id) AS items_available
       FROM communities c
       LEFT JOIN user_community uc ON c.community_id = uc.community_id
       LEFT JOIN items i ON uc.user_id = i.owner_id AND i.is_active = 1
       GROUP BY c.community_id, c.name
       ORDER BY members DESC`
    );

    const { rows: recentActivity } = await query(
      `SELECT 
        b.booking_id,
        b.status,
        b.created_at,
        i.title AS item_title,
        borrower.name AS borrower_name,
        lender.name AS lender_name
       FROM bookings b
       JOIN items i ON b.item_id = i.item_id
       JOIN users borrower ON b.borrower_id = borrower.user_id
       JOIN users lender ON b.lender_id = lender.user_id
       ORDER BY b.booking_id DESC
       LIMIT 5`
    );

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalUsers: usersCount[0]?.total_users || 0,
          totalItems: itemsCount[0]?.total_items || 0,
          totalCommunities: commsCount[0]?.total_communities || 0,
          totalBookings: bookingsCount[0]?.total_bookings || 0,
          activeLoans: activeLoans[0]?.active_loans || 0,
          totalDepositHeld: depositSum[0]?.total_deposit_held || 0
        },
        categoryStats,
        communityStats,
        recentActivity
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

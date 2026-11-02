const { pool } = require('../config/db');

// Overall analytics & DBMS aggregations
async function getDashboardStats(req, res) {
  try {
    // 1. Total counts across entities
    const [[{ total_users }]] = await pool.query('SELECT COUNT(*) AS total_users FROM users');
    const [[{ total_items }]] = await pool.query('SELECT COUNT(*) AS total_items FROM items WHERE is_active = 1');
    const [[{ total_communities }]] = await pool.query('SELECT COUNT(*) AS total_communities FROM communities');
    const [[{ total_bookings }]] = await pool.query('SELECT COUNT(*) AS total_bookings FROM bookings');
    const [[{ active_loans }]] = await pool.query("SELECT COUNT(*) AS active_loans FROM bookings WHERE status IN ('approved', 'requested')");
    
    // 2. Deposit aggregations
    const [[{ total_deposit_held }]] = await pool.query(
      "SELECT COALESCE(SUM(deposit_held), 0) AS total_deposit_held FROM bookings WHERE status IN ('approved', 'requested')"
    );

    // 3. Category distribution (DBMS GROUP BY)
    const [categoryStats] = await pool.query(
      `SELECT category, COUNT(*) AS count, ROUND(AVG(deposit_amount), 2) AS avg_deposit
       FROM items
       WHERE is_active = 1
       GROUP BY category
       ORDER BY count DESC`
    );

    // 4. Community participation (DBMS JOIN & GROUP BY)
    const [communityStats] = await pool.query(
      `SELECT c.name, COUNT(DISTINCT uc.user_id) AS members, COUNT(DISTINCT i.item_id) AS items_available
       FROM communities c
       LEFT JOIN user_community uc ON c.community_id = uc.community_id
       LEFT JOIN items i ON uc.user_id = i.owner_id AND i.is_active = 1
       GROUP BY c.community_id, c.name
       ORDER BY members DESC`
    );

    // 5. Recent Activity feed (DBMS UNION / JOIN)
    const [recentBookings] = await pool.query(
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

    res.json({
      success: true,
      data: {
        summary: {
          totalUsers: total_users,
          totalItems: total_items,
          totalCommunities: total_communities,
          totalBookings: total_bookings,
          activeLoans: active_loans,
          totalDepositHeld: total_deposit_held
        },
        categoryStats,
        communityStats,
        recentActivity: recentBookings
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getDashboardStats
};

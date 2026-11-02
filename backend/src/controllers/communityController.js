const { pool } = require('../config/db');

// Get all communities with stats (member count, items count)
async function getCommunities(req, res) {
  try {
    const [rows] = await pool.query(
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

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getCommunities error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get single community details + members + tools
async function getCommunityById(req, res) {
  try {
    const { id } = req.params;

    const [comms] = await pool.query(
      `SELECT community_id, name, type FROM communities WHERE community_id = ?`,
      [id]
    );

    if (comms.length === 0) {
      return res.status(404).json({ success: false, message: 'Community not found' });
    }

    const community = comms[0];

    // Members
    const [members] = await pool.query(
      `SELECT u.user_id, u.name, u.email, u.role, uc.joined_at
       FROM user_community uc
       JOIN users u ON uc.user_id = u.user_id
       WHERE uc.community_id = ?`,
      [id]
    );

    // Tools available from members in this community
    const [tools] = await pool.query(
      `SELECT i.item_id, i.title, i.category, i.item_condition, i.deposit_amount, u.name AS owner_name
       FROM items i
       JOIN users u ON i.owner_id = u.user_id
       JOIN user_community uc ON u.user_id = uc.user_id
       WHERE uc.community_id = ? AND i.is_active = 1`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...community,
        members,
        tools
      }
    });
  } catch (error) {
    console.error('getCommunityById error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create new community
async function createCommunity(req, res) {
  try {
    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).json({ success: false, message: 'Name and type are required' });
    }

    const [result] = await pool.query(
      `INSERT INTO communities (name, type) VALUES (?, ?)`,
      [name, type]
    );

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: { community_id: result.insertId, name, type }
    });
  } catch (error) {
    console.error('createCommunity error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// User joins community
async function joinCommunity(req, res) {
  try {
    const { community_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    await pool.query(
      `INSERT IGNORE INTO user_community (user_id, community_id) VALUES (?, ?)`,
      [user_id, community_id]
    );

    res.json({ success: true, message: 'Successfully joined community' });
  } catch (error) {
    console.error('joinCommunity error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// User leaves community
async function leaveCommunity(req, res) {
  try {
    const { community_id } = req.params;
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id is required' });
    }

    await pool.query(
      `DELETE FROM user_community WHERE user_id = ? AND community_id = ?`,
      [user_id, community_id]
    );

    res.json({ success: true, message: 'Successfully left community' });
  } catch (error) {
    console.error('leaveCommunity error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getCommunities,
  getCommunityById,
  createCommunity,
  joinCommunity,
  leaveCommunity
};

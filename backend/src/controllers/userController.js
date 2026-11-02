const { pool } = require('../config/db');

// List all users
async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id, name, email, role, phone, address, created_at FROM users ORDER BY user_id ASC`
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getUsers error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get single user by ID with community memberships and items
async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const [users] = await pool.query(
      `SELECT user_id, name, email, role, phone, address, created_at FROM users WHERE user_id = ?`,
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const user = users[0];

    // Joined communities
    const [communities] = await pool.query(
      `SELECT c.community_id, c.name, c.type, uc.joined_at
       FROM user_community uc
       JOIN communities c ON uc.community_id = c.community_id
       WHERE uc.user_id = ?`,
      [id]
    );

    // Items owned
    const [items] = await pool.query(
      `SELECT item_id, category, title, description, item_condition, deposit_amount, is_active
       FROM items
       WHERE owner_id = ?`,
      [id]
    );

    // Reputation / ratings received
    const [ratingStats] = await pool.query(
      `SELECT COUNT(*) as review_count, COALESCE(AVG(score), 5.0) as average_score
       FROM ratings
       WHERE ratee_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...user,
        communities,
        items,
        reputation: {
          reviews: ratingStats[0].review_count,
          avgScore: parseFloat(ratingStats[0].average_score).toFixed(1)
        }
      }
    });
  } catch (error) {
    console.error('getUserById error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create new user
async function createUser(req, res) {
  try {
    const { name, email, password, role = 'member', phone, address, community_id } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const password_hash = password ? `hash_${password}` : 'hash_default_secret';

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone, address)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, password_hash, role, phone || null, address || null]
    );

    const newUserId = result.insertId;

    // Optionally join community immediately
    if (community_id) {
      await pool.query(
        `INSERT IGNORE INTO user_community (user_id, community_id) VALUES (?, ?)`,
        [newUserId, community_id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: { user_id: newUserId, name, email, role, phone, address }
    });
  } catch (error) {
    console.error('createUser error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update user (role, phone, address)
async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, role, phone, address } = req.body;

    await pool.query(
      `UPDATE users SET
        name = COALESCE(?, name),
        role = COALESCE(?, role),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address)
       WHERE user_id = ?`,
      [name, role, phone, address, id]
    );

    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('updateUser error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete user
async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM users WHERE user_id = ?`, [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    console.error('deleteUser error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};

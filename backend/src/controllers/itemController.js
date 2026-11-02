const { pool } = require('../config/db');

// Get all items with rich joins (owner info, community names, rating, current availability)
async function getItems(req, res) {
  try {
    const { category, search, condition, community_id, active = 'true' } = req.query;

    let query = `
      SELECT 
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
        u.address AS owner_address,
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
      WHERE 1=1
    `;

    const params = [];

    if (active === 'true') {
      query += ` AND i.is_active = 1`;
    }

    if (category && category !== 'All') {
      query += ` AND i.category = ?`;
      params.push(category);
    }

    if (condition && condition !== 'All') {
      query += ` AND i.item_condition = ?`;
      params.push(condition);
    }

    if (community_id) {
      query += ` AND uc.community_id = ?`;
      params.push(community_id);
    }

    if (search) {
      query += ` AND (i.title LIKE ? OR i.description LIKE ? OR i.category LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    query += `
      GROUP BY i.item_id, i.owner_id, i.category, i.title, i.description, i.item_condition, i.deposit_amount, i.is_active, u.name, u.email, u.phone, u.address
      ORDER BY i.item_id DESC
    `;

    const [rows] = await pool.query(query, params);

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getItems error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get single item by ID
async function getItemById(req, res) {
  try {
    const { id } = req.params;

    const [items] = await pool.query(
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
      return res.status(404).json({ success: false, message: 'Item not found' });
    }

    const item = items[0];

    // Availability schedules
    const [availability] = await pool.query(
      `SELECT availability_id, start_date, end_date, status
       FROM availability
       WHERE item_id = ?
       ORDER BY start_date ASC`,
      [id]
    );

    // Past reviews for this item
    const [reviews] = await pool.query(
      `SELECT r.rating_id, r.score, r.comment, rater.name AS reviewer_name, b.start_date, b.end_date
       FROM ratings r
       JOIN bookings b ON r.booking_id = b.booking_id
       JOIN users rater ON r.rater_id = rater.user_id
       WHERE b.item_id = ?
       ORDER BY r.rating_id DESC`,
      [id]
    );

    res.json({
      success: true,
      data: {
        ...item,
        availability,
        reviews
      }
    });
  } catch (error) {
    console.error('getItemById error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create new item
async function createItem(req, res) {
  try {
    const {
      owner_id,
      category,
      title,
      description,
      item_condition = 'Good',
      deposit_amount = 0,
      start_date,
      end_date
    } = req.body;

    if (!owner_id || !category || !title) {
      return res.status(400).json({
        success: false,
        message: 'owner_id, category, and title are required.'
      });
    }

    // Insert item
    const [result] = await pool.query(
      `INSERT INTO items (owner_id, category, title, description, item_condition, deposit_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [owner_id, category, title, description || '', item_condition, deposit_amount]
    );

    const newItemId = result.insertId;

    // Insert initial availability slot if provided
    if (start_date && end_date) {
      await pool.query(
        `INSERT INTO availability (item_id, start_date, end_date, status) VALUES (?, ?, ?, 'available')`,
        [newItemId, start_date, end_date]
      );
    } else {
      // Default availability: today until 3 months ahead
      const today = new Date().toISOString().split('T')[0];
      const threeMonths = new Date();
      threeMonths.setMonth(threeMonths.getMonth() + 3);
      const futureDate = threeMonths.toISOString().split('T')[0];

      await pool.query(
        `INSERT INTO availability (item_id, start_date, end_date, status) VALUES (?, ?, ?, 'available')`,
        [newItemId, today, futureDate]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Item listed successfully',
      data: {
        item_id: newItemId,
        owner_id,
        category,
        title,
        description,
        item_condition,
        deposit_amount
      }
    });
  } catch (error) {
    console.error('createItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update item
async function updateItem(req, res) {
  try {
    const { id } = req.params;
    const { category, title, description, item_condition, deposit_amount, is_active } = req.body;

    await pool.query(
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

    res.json({ success: true, message: 'Item updated successfully' });
  } catch (error) {
    console.error('updateItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete or deactivate item
async function deleteItem(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`UPDATE items SET is_active = 0 WHERE item_id = ?`, [id]);
    res.json({ success: true, message: 'Item deactivated successfully' });
  } catch (error) {
    console.error('deleteItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem
};

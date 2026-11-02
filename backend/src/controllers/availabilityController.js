const { pool } = require('../config/db');

// Get availability for an item
async function getAvailability(req, res) {
  try {
    const { itemId } = req.params;
    const [rows] = await pool.query(
      `SELECT availability_id, item_id, start_date, end_date, status
       FROM availability
       WHERE item_id = ?
       ORDER BY start_date ASC`,
      [itemId]
    );

    res.json({ success: true, count: rows.length, data: rows });
  } catch (error) {
    console.error('getAvailability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Add availability window for an item
async function addAvailability(req, res) {
  try {
    const { item_id, start_date, end_date, status = 'available' } = req.body;

    if (!item_id || !start_date || !end_date) {
      return res.status(400).json({
        success: false,
        message: 'item_id, start_date, and end_date are required'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO availability (item_id, start_date, end_date, status)
       VALUES (?, ?, ?, ?)`,
      [item_id, start_date, end_date, status]
    );

    res.status(201).json({
      success: true,
      message: 'Availability schedule added',
      data: {
        availability_id: result.insertId,
        item_id,
        start_date,
        end_date,
        status
      }
    });
  } catch (error) {
    console.error('addAvailability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update availability status
async function updateAvailability(req, res) {
  try {
    const { id } = req.params;
    const { status, start_date, end_date } = req.body;

    await pool.query(
      `UPDATE availability SET
        status = COALESCE(?, status),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date)
       WHERE availability_id = ?`,
      [status, start_date, end_date, id]
    );

    res.json({ success: true, message: 'Availability schedule updated' });
  } catch (error) {
    console.error('updateAvailability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete availability
async function deleteAvailability(req, res) {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM availability WHERE availability_id = ?`, [id]);
    res.json({ success: true, message: 'Availability slot removed' });
  } catch (error) {
    console.error('deleteAvailability error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getAvailability,
  addAvailability,
  updateAvailability,
  deleteAvailability
};

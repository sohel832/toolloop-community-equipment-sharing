const { pool } = require('../config/db');
const runSeed = require('../../scripts/seed');

const ALLOWED_TABLES = [
  'users',
  'communities',
  'user_community',
  'items',
  'availability',
  'bookings',
  'ratings',
  'payments'
];

// Get overview of all tables in toolloop database with row counts
async function getDbOverview(req, res) {
  try {
    const tableOverviews = [];

    for (const table of ALLOWED_TABLES) {
      try {
        const [[{ count }]] = await pool.query(`SELECT COUNT(*) as count FROM \`${table}\``);
        const [columns] = await pool.query(`DESCRIBE \`${table}\``);
        tableOverviews.push({
          name: table,
          rowCount: count,
          columns: columns.map(c => ({
            field: c.Field,
            type: c.Type,
            null: c.Null,
            key: c.Key,
            default: c.Default,
            extra: c.Extra
          }))
        });
      } catch (err) {
        tableOverviews.push({
          name: table,
          rowCount: 0,
          error: err.message,
          columns: []
        });
      }
    }

    res.json({ success: true, database: 'toolloop', tables: tableOverviews });
  } catch (error) {
    console.error('getDbOverview error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get rows for a specific table
async function getTableData(req, res) {
  try {
    const { table } = req.params;
    const limit = Math.min(parseInt(req.query.limit || '50', 10), 200);

    if (!ALLOWED_TABLES.includes(table)) {
      return res.status(400).json({ success: false, message: `Table '${table}' is not recognized.` });
    }

    const [columns] = await pool.query(`DESCRIBE \`${table}\``);
    const [rows] = await pool.query(`SELECT * FROM \`${table}\` LIMIT ?`, [limit]);

    res.json({
      success: true,
      table,
      columns,
      totalRows: rows.length,
      data: rows
    });
  } catch (error) {
    console.error('getTableData error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Safe SQL query runner for lab viva / demonstration
async function executeCustomQuery(req, res) {
  try {
    const { sql } = req.body;

    if (!sql || typeof sql !== 'string') {
      return res.status(400).json({ success: false, message: 'SQL query string is required' });
    }

    const cleanSql = sql.trim();

    // Prevent dangerous operations that drop system or current DB
    const forbidden = [/drop\s+database/i, /truncate\s+database/i, /alter\s+user/i, /grant/i, /revoke/i];
    for (const pattern of forbidden) {
      if (pattern.test(cleanSql)) {
        return res.status(403).json({
          success: false,
          message: 'Operation not permitted in safe explorer console.'
        });
      }
    }

    const startTime = process.hrtime();
    const [result, fields] = await pool.query(cleanSql);
    const diff = process.hrtime(startTime);
    const executionTimeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

    let rows = [];
    let affectedRows = 0;
    let insertId = 0;

    if (Array.isArray(result)) {
      rows = result;
    } else if (result && typeof result === 'object') {
      affectedRows = result.affectedRows || 0;
      insertId = result.insertId || 0;
    }

    res.json({
      success: true,
      sql: cleanSql,
      executionTimeMs: `${executionTimeMs} ms`,
      affectedRows,
      insertId,
      columnCount: fields ? fields.length : 0,
      columns: fields ? fields.map(f => f.name) : [],
      data: rows
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
      sqlState: error.sqlState,
      code: error.code
    });
  }
}

// Trigger DB seeder from the API / UI
async function seedDatabase(req, res) {
  try {
    await runSeed();
    res.json({ success: true, message: 'Database reset and sample data populated successfully!' });
  } catch (error) {
    console.error('seedDatabase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

module.exports = {
  getDbOverview,
  getTableData,
  executeCustomQuery,
  seedDatabase
};

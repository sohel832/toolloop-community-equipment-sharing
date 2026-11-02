const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'NewRootPassword123!',
  database: process.env.DB_NAME || 'toolloop',
  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  dateStrings: true
});

async function ensurePaymentColumns() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM payments LIKE 'razorpay_payment_id'");
    if (cols.length === 0) {
      await pool.query("ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(100) NULL, ADD COLUMN razorpay_payment_id VARCHAR(100) NULL, ADD COLUMN razorpay_signature VARCHAR(255) NULL");
      console.log('[MySQL] Added Razorpay payment tracking columns to payments table.');
    }
  } catch (err) {
    // Graceful fallback if table not yet created
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Successfully connected to database: ${process.env.DB_NAME || 'toolloop'}`);
    connection.release();
    await ensurePaymentColumns();
    return true;
  } catch (error) {
    console.error('[MySQL] Connection error:', error.message);
    return false;
  }
}

module.exports = {
  pool,
  testConnection,
  ensurePaymentColumns
};

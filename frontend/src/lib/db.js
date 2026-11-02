import mysql from 'mysql2/promise';

let pool;
let columnsEnsured = false;

export function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'NewRootPassword123!',
      database: process.env.DB_NAME || 'toolloop',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      dateStrings: true
    });
  }
  return pool;
}

export async function ensurePaymentColumns() {
  if (columnsEnsured) return;
  try {
    const p = getPool();
    const [cols] = await p.query("SHOW COLUMNS FROM payments LIKE 'razorpay_payment_id'");
    if (cols.length === 0) {
      await p.query("ALTER TABLE payments ADD COLUMN razorpay_order_id VARCHAR(100) NULL, ADD COLUMN razorpay_payment_id VARCHAR(100) NULL, ADD COLUMN razorpay_signature VARCHAR(255) NULL");
    }
    columnsEnsured = true;
  } catch (err) {
    // Columns might already exist or table not created yet
    columnsEnsured = true;
  }
}

export async function query(sql, params = []) {
  const p = getPool();
  await ensurePaymentColumns();
  const [rows, fields] = await p.query(sql, params);
  return { rows, fields };
}

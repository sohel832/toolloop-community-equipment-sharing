import mysql from 'mysql2/promise';

let pool;
let columnsEnsured = false;

export function getPool() {
  if (!pool) {
    const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
    const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
    const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'NewRootPassword123!';
    const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'toolloop';

    const poolConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
      ? {
          uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: 10,
          dateStrings: true
        }
      : {
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          database: dbName,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          enableKeepAlive: true,
          dateStrings: true
        };

    pool = mysql.createPool(poolConfig);
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
    columnsEnsured = true;
  }
}

export async function query(sql, params = []) {
  const p = getPool();
  await ensurePaymentColumns();
  const [rows, fields] = await p.query(sql, params);
  return { rows, fields };
}

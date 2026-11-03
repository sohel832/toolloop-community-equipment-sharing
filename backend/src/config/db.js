const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

// Support standard Railway & local variables
const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'NewRootPassword123!';
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'toolloop';

const poolConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
  ? {
      uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 15,
      enableKeepAlive: true,
      dateStrings: true
    }
  : {
      host: dbHost,
      port: dbPort,
      user: dbUser,
      password: dbPassword,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 15,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      dateStrings: true
    };

const pool = mysql.createPool(poolConfig);

async function autoInitializeSchema() {
  try {
    const [tables] = await pool.query("SHOW TABLES LIKE 'users'");
    if (tables.length === 0) {
      console.log('[MySQL] Fresh database detected. Auto-initializing schema from schema.sql...');
      const schemaPath = path.join(__dirname, '..', '..', 'scripts', 'schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');
        const statements = schemaSql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
          await pool.query(stmt);
        }
        console.log('[MySQL] All 8 tables created successfully!');
      }

      // Also populate seed data
      const seedPath = path.join(__dirname, '..', '..', 'scripts', 'seed.sql');
      if (fs.existsSync(seedPath)) {
        console.log('[MySQL] Populating initial demo seed data...');
        const seedSql = fs.readFileSync(seedPath, 'utf8');
        const seedStatements = seedSql.split(';').map(s => s.trim()).filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));
        for (const sStmt of seedStatements) {
          try {
            await pool.query(sStmt);
          } catch (seedErr) {
            // Ignore minor duplicate warnings
          }
        }
        console.log('[MySQL] Seed accounts and equipment created successfully!');
      }
    }
  } catch (err) {
    console.warn('[MySQL AutoInit Warning]', err.message);
  }
}

async function ensurePaymentColumns() {
  try {
    const [userCols] = await pool.query("SHOW COLUMNS FROM users LIKE 'upi_id'");
    if (userCols.length === 0) {
      await pool.query("ALTER TABLE users ADD COLUMN upi_id VARCHAR(100) NULL");
      await pool.query("UPDATE users SET upi_id = 's9611668103@ptyes' WHERE user_id = 1");
    }
  } catch (err) {}

  try {
    const [itemCols] = await pool.query("SHOW COLUMNS FROM items LIKE 'rental_rate'");
    if (itemCols.length === 0) {
      await pool.query("ALTER TABLE items ADD COLUMN rental_rate DECIMAL(10,2) DEFAULT 0");
    }
  } catch (err) {}

  try {
    const [bookingCols] = await pool.query("SHOW COLUMNS FROM bookings LIKE 'rental_charges'");
    if (bookingCols.length === 0) {
      await pool.query("ALTER TABLE bookings ADD COLUMN rental_charges DECIMAL(10,2) DEFAULT 0, ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 20.00, ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0");
    }
  } catch (err) {}

  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM payments LIKE 'receipt_number'");
    if (cols.length === 0) {
      await pool.query(`ALTER TABLE payments 
        ADD COLUMN receipt_number VARCHAR(100) NULL,
        ADD COLUMN transaction_id VARCHAR(100) NULL,
        ADD COLUMN rental_charges DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 20.00,
        ADD COLUMN security_deposit DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN upi_app VARCHAR(50) DEFAULT 'PhonePe',
        ADD COLUMN upi_ref_id VARCHAR(100) NULL,
        ADD COLUMN payer_upi_id VARCHAR(100) NULL,
        ADD COLUMN payee_upi_id VARCHAR(100) NULL,
        ADD COLUMN refund_status VARCHAR(30) DEFAULT 'none',
        ADD COLUMN refund_amount DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN refund_date TIMESTAMP NULL,
        ADD COLUMN receipt_email VARCHAR(150) NULL,
        ADD COLUMN razorpay_order_id VARCHAR(100) NULL,
        ADD COLUMN razorpay_payment_id VARCHAR(100) NULL,
        ADD COLUMN razorpay_signature VARCHAR(255) NULL`);
      console.log('[MySQL] Added receipt and UPI columns to payments table.');
    }
  } catch (err) {
    // Graceful fallback if table not yet created
  }
}

async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[MySQL] Successfully connected to database: ${dbName} at ${dbHost}:${dbPort}`);
    connection.release();
    await autoInitializeSchema();
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

import mysql from 'mysql2/promise';

let pool;
let schemaEnsured = false;

export function getPool() {
  if (!pool) {
    const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
    const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
    const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
    const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'NewRootPassword123!';
    const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'toolloop';

    // Cloud MySQL (TiDB Cloud, Aiven, PlanetScale, AWS) SSL Detection
    const requiresSsl = Boolean(
      process.env.DB_SSL === 'true' ||
      (dbHost && (
        dbHost.includes('tidbcloud.com') ||
        dbHost.includes('aivencloud.com') ||
        dbHost.includes('aws') ||
        dbHost.includes('azure') ||
        dbHost.includes('railway')
      ))
    );

    const sslConfig = requiresSsl ? { minVersion: 'TLSv1.2', rejectUnauthorized: true } : undefined;

    const poolConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
      ? {
          uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
          waitForConnections: true,
          connectionLimit: 10,
          dateStrings: true,
          ssl: sslConfig
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
          dateStrings: true,
          ssl: sslConfig
        };

    pool = mysql.createPool(poolConfig);
  }
  return pool;
}

export async function ensureDatabaseSchema() {
  if (schemaEnsured) return;
  try {
    const p = getPool();
    const [tables] = await p.query("SHOW TABLES LIKE 'users'");
    
    if (tables.length === 0) {
      console.log('[MySQL] Creating ToolLoop tables on new database...');

      await p.query(`CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) NOT NULL,
        phone VARCHAR(15),
        address VARCHAR(255),
        upi_id VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS communities (
        community_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS user_community (
        user_id INT,
        community_id INT,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, community_id)
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS items (
        item_id INT PRIMARY KEY AUTO_INCREMENT,
        owner_id INT NOT NULL,
        category VARCHAR(50) NOT NULL,
        title VARCHAR(100) NOT NULL,
        description VARCHAR(500),
        item_condition VARCHAR(50),
        rental_rate DECIMAL(10,2) DEFAULT 0,
        deposit_amount DECIMAL(10,2) DEFAULT 0,
        is_active BOOLEAN DEFAULT TRUE
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS availability (
        availability_id INT PRIMARY KEY AUTO_INCREMENT,
        item_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(20) DEFAULT 'available'
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS bookings (
        booking_id INT PRIMARY KEY AUTO_INCREMENT,
        item_id INT NOT NULL,
        borrower_id INT NOT NULL,
        lender_id INT NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        rental_charges DECIMAL(10,2) DEFAULT 0,
        platform_fee DECIMAL(10,2) DEFAULT 20.00,
        deposit_held DECIMAL(10,2) DEFAULT 0,
        total_paid DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(30) DEFAULT 'requested',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS ratings (
        rating_id INT PRIMARY KEY AUTO_INCREMENT,
        booking_id INT NOT NULL,
        rater_id INT NOT NULL,
        ratee_id INT NOT NULL,
        score INT NOT NULL,
        comment VARCHAR(500)
      )`);

      await p.query(`CREATE TABLE IF NOT EXISTS payments (
        payment_id INT PRIMARY KEY AUTO_INCREMENT,
        receipt_number VARCHAR(100) UNIQUE,
        transaction_id VARCHAR(100) UNIQUE,
        booking_id INT NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        rental_charges DECIMAL(10,2) DEFAULT 0,
        platform_fee DECIMAL(10,2) DEFAULT 20.00,
        security_deposit DECIMAL(10,2) DEFAULT 0,
        status VARCHAR(30) DEFAULT 'pending',
        method VARCHAR(50) DEFAULT 'UPI',
        upi_app VARCHAR(50) DEFAULT 'PhonePe',
        upi_ref_id VARCHAR(100),
        payer_upi_id VARCHAR(100),
        payee_upi_id VARCHAR(100),
        razorpay_order_id VARCHAR(100),
        razorpay_payment_id VARCHAR(100),
        razorpay_signature VARCHAR(255),
        refund_status VARCHAR(30) DEFAULT 'none',
        refund_amount DECIMAL(10,2) DEFAULT 0,
        refund_date TIMESTAMP NULL,
        receipt_email VARCHAR(150),
        payment_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`);

      // Seed initial accounts & sample equipment with UPI IDs
      await p.query(`INSERT IGNORE INTO users (user_id, name, email, password_hash, role, phone, address, upi_id) VALUES
        (1, 'Sohel M Chapparband', 'sohel@pesu.edu', 'hash_sohel_826', 'admin', '+91 96116 68103', 'PES University RR Campus, Bangalore', 's9611668103@ptyes'),
        (2, 'Shreyas Bellad', 'shreyas@pesu.edu', 'hash_shreyas_824', 'admin', '+91 98452 67890', 'Banashankari 3rd Stage, Bangalore', 'shreyas.bellad@okhdfcbank'),
        (3, 'Priya Sharma', 'priya.sharma@example.com', 'hash_priya_pass', 'member', '+91 98765 43210', 'Indiranagar 100ft Road, Bangalore', 'priyasharma@oksbi'),
        (4, 'Rahul Verma', 'rahul.v@example.com', 'hash_rahul_pass', 'member', '+91 91234 56789', 'Koramangala 4th Block, Bangalore', 'rahulv@okaxis')`);

      await p.query(`INSERT IGNORE INTO communities (community_id, name, type) VALUES
        (1, 'PES University Campus Makers', 'College Campus'),
        (2, 'Indiranagar Urban Gardeners & DIY', 'Neighborhood'),
        (3, 'Koramangala Tech & Tools Hub', 'Apartment Complex')`);

      await p.query(`INSERT IGNORE INTO user_community (user_id, community_id) VALUES
        (1, 1), (1, 2), (2, 1), (3, 2), (4, 3)`);

      await p.query(`INSERT IGNORE INTO items (item_id, owner_id, category, title, description, item_condition, rental_rate, deposit_amount, is_active) VALUES
        (1, 1, 'Power Tools', 'Bosch Professional Cordless Impact Drill (18V)', 'Heavy duty cordless drill with brushless motor, 2 batteries, charger and bit set.', 'Like New', 250.00, 1500.00, true),
        (2, 1, 'Gardening', 'Karcher High-Pressure Washer K 3.450', 'Compact 120 bar pressure washer ideal for cleaning driveways and vehicles.', 'Good', 300.00, 2000.00, true),
        (3, 2, 'Woodworking', 'DeWalt 7-1/4 Inch Circular Saw', 'Precision laser guide circular saw for clean rip cuts in timber.', 'Good', 200.00, 1800.00, true),
        (4, 3, 'Outdoor & Camping', 'Decathlon Quechua 4-Person Waterproof Tent', 'Quick-pitch dome tent with blackout fabric and ground tarp.', 'Like New', 150.00, 1200.00, true)`);

      await p.query(`INSERT IGNORE INTO availability (availability_id, item_id, start_date, end_date, status) VALUES
        (1, 1, '2026-11-01', '2026-12-31', 'available'),
        (2, 2, '2026-11-01', '2026-11-20', 'available')`);

      console.log('[MySQL] Schema and demo records created successfully!');
    } else {
      // Ensure migrations for existing databases
      try {
        const [userCols] = await p.query("SHOW COLUMNS FROM users LIKE 'upi_id'");
        if (userCols.length === 0) {
          await p.query("ALTER TABLE users ADD COLUMN upi_id VARCHAR(100) NULL");
          await p.query("UPDATE users SET upi_id = 's9611668103@ptyes' WHERE user_id = 1");
          await p.query("UPDATE users SET upi_id = 'priyasharma@oksbi' WHERE user_id = 3");
        }
      } catch (e) { /* ignore */ }

      try {
        const [itemCols] = await p.query("SHOW COLUMNS FROM items LIKE 'rental_rate'");
        if (itemCols.length === 0) {
          await p.query("ALTER TABLE items ADD COLUMN rental_rate DECIMAL(10,2) DEFAULT 0");
          await p.query("UPDATE items SET rental_rate = 250 WHERE item_id = 1");
          await p.query("UPDATE items SET rental_rate = 300 WHERE item_id = 2");
        }
      } catch (e) { /* ignore */ }

      try {
        const [bookingCols] = await p.query("SHOW COLUMNS FROM bookings LIKE 'rental_charges'");
        if (bookingCols.length === 0) {
          await p.query("ALTER TABLE bookings ADD COLUMN rental_charges DECIMAL(10,2) DEFAULT 0, ADD COLUMN platform_fee DECIMAL(10,2) DEFAULT 20.00, ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0");
        }
      } catch (e) { /* ignore */ }

      try {
        const [payCols] = await p.query("SHOW COLUMNS FROM payments LIKE 'receipt_number'");
        if (payCols.length === 0) {
          await p.query(`ALTER TABLE payments 
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
        }
      } catch (e) { /* ignore */ }
    }
    schemaEnsured = true;
  } catch (err) {
    console.warn('[MySQL Schema Warning]', err.message);
    schemaEnsured = true;
  }
}

export async function query(sql, params = []) {
  const p = getPool();
  await ensureDatabaseSchema();
  const [rows, fields] = await p.query(sql, params);
  return { rows, fields };
}

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function runSeed() {
  console.log('--- ToolLoop DBMS Database Seeder ---');
  console.log(`Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`Database: ${process.env.DB_NAME || 'toolloop'}`);

  let connection;
  try {
    // Connect to MySQL server (first without database in case it needs to be created)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'NewRootPassword123!',
      multipleStatements: true
    });

    console.log('[1/3] Ensuring database exists...');
    await connection.query('CREATE DATABASE IF NOT EXISTS toolloop;');
    await connection.query('USE toolloop;');

    console.log('[2/3] Applying schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    console.log('[3/3] Populating seed records...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('✓ Seed data populated successfully.');

    console.log('\n--- Summary of records in toolloop ---');
    const [tables] = await connection.query('SHOW TABLES;');
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName};`);
      console.log(`  Table [${tableName}]: ${count} rows`);
    }

    console.log('\nSeed completed successfully!');
  } catch (err) {
    console.error('Seed Error:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = runSeed;

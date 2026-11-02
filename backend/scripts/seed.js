const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const dbHost = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const dbPort = parseInt(process.env.MYSQLPORT || process.env.DB_PORT || '3306', 10);
const dbUser = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const dbPassword = process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'NewRootPassword123!';
const dbName = process.env.MYSQLDATABASE || process.env.DB_NAME || 'toolloop';

async function runSeed() {
  console.log('--- ToolLoop DBMS Database Seeder ---');
  console.log(`Host: ${dbHost}:${dbPort}`);
  console.log(`Database: ${dbName}`);

  let connection;
  try {
    const connConfig = (process.env.MYSQL_URL || process.env.DATABASE_URL)
      ? {
          uri: process.env.MYSQL_URL || process.env.DATABASE_URL,
          multipleStatements: true
        }
      : {
          host: dbHost,
          port: dbPort,
          user: dbUser,
          password: dbPassword,
          multipleStatements: true
        };

    connection = await mysql.createConnection(connConfig);

    console.log('[1/3] Ensuring database exists...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.query(`USE \`${dbName}\`;`);

    console.log('[2/3] Applying schema...');
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await connection.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    console.log('[3/3] Populating seed records...');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');
    await connection.query(seedSql);
    console.log('✓ Seed data populated successfully.');

    console.log('\n--- Summary of records in database ---');
    const [tables] = await connection.query('SHOW TABLES;');
    for (const row of tables) {
      const tableName = Object.values(row)[0];
      const [[{ count }]] = await connection.query(`SELECT COUNT(*) as count FROM \`${tableName}\`;`);
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

/**
 * Database Migration Runner
 * Runs all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const runMigrations = async () => {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'ubereats'}`);
    console.log(`✅ Database '${process.env.DB_NAME || 'ubereats'}' ready`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME || 'ubereats'}`);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    console.log(`\n📁 Found ${files.length} migration files\n`);

    // Run each migration
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');

      console.log(`⏳ Running: ${file}...`);

      try {
        await connection.query(sql);
        console.log(`✅ Completed: ${file}\n`);
      } catch (error) {
        console.error(`❌ Error in ${file}:`, error.message);
        throw error;
      }
    }

    console.log('🎉 All migrations completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

// Run migrations
runMigrations();

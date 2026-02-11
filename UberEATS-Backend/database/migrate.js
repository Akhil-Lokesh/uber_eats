/**
 * Database Migration Runner
 * Runs all SQL migration files in order
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

const runMigrations = async () => {
  let client;
  let dbClient;

  try {
    // First, connect to the default postgres database to create our database
    client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres' // Connect to default database
    });

    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'ubereats';
    try {
      await client.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created`);
    } catch (error) {
      if (error.code === '42P04') {
        console.log(`✅ Database '${dbName}' already exists`);
      } else {
        throw error;
      }
    }

    await client.end();

    // Now connect to our target database
    dbClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: dbName
    });

    await dbClient.connect();
    console.log(`✅ Connected to database '${dbName}'`);

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
        await dbClient.query(sql);
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
    if (dbClient) {
      await dbClient.end();
    }
    if (client) {
      await client.end();
    }
  }
};

// Run migrations
runMigrations();

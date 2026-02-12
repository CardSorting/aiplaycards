import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_BV2PWfI4gbrS@ep-fragrant-hall-a4gdomyc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

console.log('Testing database connection...');

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 10000,
});

async function testConnection() {
  try {
    const client = await pool.connect();
    console.log('✅ Connected successfully!');

    // Test query
    const result = await client.query('SELECT version()');
    console.log(
      '✅ Database version:',
      result.rows[0].version.split(' ')[0] +
        ' ' +
        result.rows[0].version.split(' ')[1],
    );

    // Check if auth_user table exists
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'auth_user'
      );
    `);

    if (tableCheck.rows[0].exists) {
      console.log('✅ auth_user table exists');

      // Check existing columns
      const columns = await client.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'auth_user'
        ORDER BY column_name;
      `);
      console.log(
        'Current columns:',
        columns.rows.map(r => r.column_name).join(', '),
      );

      // Run migration
      console.log('\nRunning migration...');
      await client.query('BEGIN');

      await client.query(
        'ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS password text',
      );
      console.log('✓ Added password column');

      await client.query(
        'ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer DEFAULT 0',
      );
      console.log('✓ Added failedLoginAttempts column');

      await client.query(
        'ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS "lockedUntil" timestamp',
      );
      console.log('✓ Added lockedUntil column');

      await client.query(
        'ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS "lastLoginAt" timestamp',
      );
      console.log('✓ Added lastLoginAt column');

      await client.query(
        'ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now()',
      );
      console.log('✓ Added createdAt column');

      await client.query('COMMIT');
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log('⚠️  auth_user table does not exist - creating it...');
      await client.query(`
        CREATE TABLE auth_user (
          id text PRIMARY KEY,
          name text,
          email text NOT NULL,
          "emailVerified" timestamp,
          image text,
          password text,
          "failedLoginAttempts" integer DEFAULT 0,
          "lockedUntil" timestamp,
          "lastLoginAt" timestamp,
          "createdAt" timestamp DEFAULT now()
        )
      `);
      console.log('✅ Created auth_user table with all security columns!');
    }

    client.release();
    await pool.end();
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    if (error.code === 'ENOTFOUND') {
      console.error(
        '\nDNS is not resolving yet. Please wait a few more minutes and try again.',
      );
      console.error(
        'You can also run the SQL manually from: drizzle/RUN_THIS_SQL.sql',
      );
    }
    process.exit(1);
  }
}

testConnection();

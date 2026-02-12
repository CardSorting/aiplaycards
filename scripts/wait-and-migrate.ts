import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://neondb_owner:npg_BV2PWfI4gbrS@ep-fragrant-hall-a4gdomyc-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

async function waitForDatabase(maxRetries = 30, delayMs = 5000) {
  for (let i = 0; i < maxRetries; i++) {
    const pool = new Pool({
      connectionString,
      connectionTimeoutMillis: 5000,
    });

    try {
      const client = await pool.connect();
      console.log('✓ Database is ready!');
      client.release();
      await pool.end();
      return true;
    } catch (error: any) {
      if (error.code === 'ENOTFOUND') {
        console.log(
          `⏳ Waiting for DNS to propagate... (attempt ${i + 1}/${maxRetries})`,
        );
        await new Promise(resolve => setTimeout(resolve, delayMs));
      } else {
        console.error('Connection error:', error.message);
        await pool.end();
        return false;
      }
    }
  }
  return false;
}

async function runMigration() {
  console.log('Waiting for database to be ready...\n');

  const isReady = await waitForDatabase();
  if (!isReady) {
    console.error(
      '\n❌ Database is not ready yet. Please wait a few minutes and try again.',
    );
    console.log('\nYou can also run the migration manually later with:');
    console.log('  npm run db:push');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  const client = await pool.connect();
  try {
    console.log('\nRunning migration...\n');

    await client.query('BEGIN');

    await client.query(
      'ALTER TABLE IF EXISTS auth_user ADD COLUMN IF NOT EXISTS password text',
    );
    console.log('✓ Added password column');

    await client.query(
      'ALTER TABLE IF EXISTS auth_user ADD COLUMN IF NOT EXISTS "failedLoginAttempts" integer DEFAULT 0',
    );
    console.log('✓ Added failedLoginAttempts column');

    await client.query(
      'ALTER TABLE IF EXISTS auth_user ADD COLUMN IF NOT EXISTS "lockedUntil" timestamp',
    );
    console.log('✓ Added lockedUntil column');

    await client.query(
      'ALTER TABLE IF EXISTS auth_user ADD COLUMN IF NOT EXISTS "lastLoginAt" timestamp',
    );
    console.log('✓ Added lastLoginAt column');

    await client.query(
      'ALTER TABLE IF EXISTS auth_user ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT now()',
    );
    console.log('✓ Added createdAt column');

    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
  } catch (error: any) {
    await client.query('ROLLBACK');
    if (error.code === '42P01') {
      console.error(
        '\n⚠️  auth_user table does not exist yet. Creating it first...',
      );
      // Create the table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS auth_user (
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
      console.log('✓ Created auth_user table with all columns');
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.error('❌ Migration failed:', error.message);
      throw error;
    }
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration().catch(console.error);

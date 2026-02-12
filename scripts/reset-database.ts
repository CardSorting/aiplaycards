import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function resetDatabase() {
  console.log('🗑️  Starting comprehensive database reset...');

  try {
    // Step 1: Drop the Drizzle migration table
    console.log('📋 Step 1: Dropping Drizzle migration tracking...');
    await db.execute(
      sql`DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;`,
    );
    console.log('✅ Dropped migration tracking table');

    // Step 2: Remove all local migration files
    console.log('📋 Step 2: Removing local migration files...');
    try {
      await execAsync('rm -rf drizzle/');
      console.log('✅ Removed local drizzle directory');
    } catch (e) {
      console.log('⚠️  No local drizzle directory found or already removed');
    }

    // Step 3: Recreate drizzle directory
    console.log('📋 Step 3: Regenerating migrations...');
    await execAsync('npm run db:generate');
    console.log('✅ Generated new migrations');

    // Step 4: Apply migrations fresh
    console.log('📋 Step 4: Applying fresh migrations...');
    await execAsync('npm run db:migrate');
    console.log('✅ Applied migrations');

    // Step 5: Run comprehensive migration if needed
    console.log('📋 Step 5: Running comprehensive migration enhancements...');
    await execAsync('npm run db:migrate:comprehensive');
    console.log('✅ Applied comprehensive enhancements');

    console.log('🎉 Database reset and migration sync completed successfully!');
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase().then(() => process.exit(0));

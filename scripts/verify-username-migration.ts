#!/usr/bin/env tsx

/**
 * Post-migration script to verify the username unique constraint
 * This script validates that the migration was successful and the constraint is working.
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { exit } from 'process';

async function verifyUsernameMigration() {
  console.log('🔍 Verifying username migration...');

  try {
    // Check if unique constraint exists
    const constraintCheck = await db.execute(sql`
      SELECT 
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints 
      WHERE table_name = 'users' 
      AND constraint_type = 'UNIQUE'
      AND constraint_name LIKE '%username%';
    `);

    if (constraintCheck.rows.length === 0) {
      console.log('❌ Username unique constraint not found!');
      exit(1);
    }

    console.log(
      '✅ Username unique constraint exists:',
      constraintCheck.rows[0].constraint_name,
    );

    // Verify no duplicates exist
    const duplicates = await db.execute(sql`
      SELECT 
        username,
        COUNT(*) as count
      FROM users 
      WHERE username IS NOT NULL 
      GROUP BY username 
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.rows.length > 0) {
      console.log('❌ Duplicate usernames still exist:');
      duplicates.rows.forEach(row => {
        console.log(`   "${row.username}" appears ${row.count} times`);
      });
      exit(1);
    }

    console.log('✅ No duplicate usernames found');

    // Test the constraint by attempting to insert a duplicate
    console.log('🧪 Testing constraint enforcement...');

    // First, find an existing username to test with
    const existingUsername = await db.execute(sql`
      SELECT username 
      FROM users 
      WHERE username IS NOT NULL 
      LIMIT 1;
    `);

    if (existingUsername.rows.length > 0) {
      const testUsername = existingUsername.rows[0].username;

      try {
        // This should fail due to the unique constraint
        await db.execute(sql`
          INSERT INTO users (user_id, username, credits, is_active) 
          VALUES ('test-constraint-check', ${testUsername}, 0, true);
        `);

        console.log('❌ Constraint test failed - duplicate was allowed!');

        // Clean up the test record
        await db.execute(
          sql`DELETE FROM users WHERE user_id = 'test-constraint-check';`,
        );
        exit(1);
      } catch (error) {
        if (
          error instanceof Error &&
          error.message.includes('duplicate key value')
        ) {
          console.log('✅ Constraint enforcement working correctly');
        } else {
          console.log(
            '⚠️  Constraint test failed with unexpected error:',
            error,
          );
        }
      }
    }

    // Get final statistics
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(username) as users_with_username,
        COUNT(DISTINCT username) as unique_usernames
      FROM users;
    `);

    const statsRow = stats.rows[0];
    console.log('\n📊 Final Statistics:');
    console.log(`   Total users: ${statsRow.total_users}`);
    console.log(`   Users with usernames: ${statsRow.users_with_username}`);
    console.log(`   Unique usernames: ${statsRow.unique_usernames}`);

    if (
      Number(statsRow.users_with_username) === Number(statsRow.unique_usernames)
    ) {
      console.log('✅ All usernames are unique');
    } else {
      console.log('❌ Username uniqueness verification failed');
      exit(1);
    }
  } catch (error) {
    console.error('❌ Error verifying migration:', error);
    exit(1);
  }
}

// Run the verification
verifyUsernameMigration()
  .then(() => {
    console.log('\n🎉 Username migration verification completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Verification failed:', error);
    process.exit(1);
  });

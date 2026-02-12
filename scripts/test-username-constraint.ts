#!/usr/bin/env tsx

/**
 * Quick test to verify the username unique constraint is working
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function testUsernameConstraint() {
  console.log('🧪 Testing username unique constraint...');

  try {
    // Check if the constraint exists
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
      return;
    }

    console.log(
      '✅ Username unique constraint exists:',
      constraintCheck.rows[0].constraint_name,
    );

    // Check for any remaining duplicates
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
      return;
    }

    console.log('✅ No duplicate usernames found');

    // Get some statistics
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(username) as users_with_username,
        COUNT(DISTINCT username) as unique_usernames
      FROM users;
    `);

    const statsRow = stats.rows[0];
    console.log('\n📊 Database Statistics:');
    console.log(`   Total users: ${statsRow.total_users}`);
    console.log(`   Users with usernames: ${statsRow.users_with_username}`);
    console.log(`   Unique usernames: ${statsRow.unique_usernames}`);

    // Test constraint enforcement (if there are existing users)
    if (Number(statsRow.users_with_username) > 0) {
      console.log('\n🔒 Testing constraint enforcement...');

      // Get an existing username to test with
      const existingUser = await db.execute(sql`
        SELECT username 
        FROM users 
        WHERE username IS NOT NULL 
        LIMIT 1;
      `);

      if (existingUser.rows.length > 0) {
        const testUsername = existingUser.rows[0].username;
        console.log(`   Attempting to create duplicate of: "${testUsername}"`);

        try {
          // This should fail
          await db.execute(sql`
            INSERT INTO users (user_id, username, credits, is_active) 
            VALUES ('constraint-test-user', ${testUsername}, 0, true);
          `);

          console.log('❌ CONSTRAINT FAILED - Duplicate was allowed!');

          // Clean up if somehow it was inserted
          await db.execute(
            sql`DELETE FROM users WHERE user_id = 'constraint-test-user';`,
          );
        } catch (error) {
          if (
            error instanceof Error &&
            error.message.includes('duplicate key value')
          ) {
            console.log('✅ Constraint working correctly - duplicate rejected');
          } else {
            console.log('⚠️  Unexpected error:', error);
          }
        }
      }
    }

    console.log('\n🎉 Username constraint test completed successfully!');
  } catch (error) {
    console.error('❌ Error testing constraint:', error);
  }
}

// Run the test
testUsernameConstraint();

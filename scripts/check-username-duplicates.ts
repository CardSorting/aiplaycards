#!/usr/bin/env tsx

/**
 * Pre-migration script to check for duplicate usernames
 * This script analyzes the current state of usernames in the database
 * before applying the unique constraint migration.
 */

import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { exit } from 'process';

async function checkUsernameDuplicates() {
  console.log('🔍 Checking for username duplicates...');

  try {
    // Check for exact duplicates (case-sensitive)
    const exactDuplicates = await db.execute(sql`
      SELECT 
        username,
        COUNT(*) as count,
        STRING_AGG(user_id, ', ') as user_ids
      FROM users 
      WHERE username IS NOT NULL 
      GROUP BY username 
      HAVING COUNT(*) > 1
      ORDER BY count DESC, username;
    `);

    // Check for case-insensitive duplicates
    const caseInsensitiveDuplicates = await db.execute(sql`
      SELECT 
        LOWER(TRIM(username)) as normalized_username,
        COUNT(*) as count,
        STRING_AGG(username || ' (' || user_id || ')', ', ') as variants
      FROM users 
      WHERE username IS NOT NULL 
      GROUP BY LOWER(TRIM(username))
      HAVING COUNT(*) > 1
      ORDER BY count DESC, normalized_username;
    `);

    // Get total username statistics
    const stats = await db.execute(sql`
      SELECT 
        COUNT(*) as total_users,
        COUNT(username) as users_with_username,
        COUNT(DISTINCT username) as unique_usernames,
        COUNT(DISTINCT LOWER(TRIM(username))) as unique_normalized_usernames
      FROM users;
    `);

    const statsRow = stats.rows[0];

    console.log('\n📊 Username Statistics:');
    console.log(`   Total users: ${statsRow.total_users}`);
    console.log(`   Users with usernames: ${statsRow.users_with_username}`);
    console.log(
      `   Unique usernames (case-sensitive): ${statsRow.unique_usernames}`,
    );
    console.log(
      `   Unique usernames (case-insensitive): ${statsRow.unique_normalized_usernames}`,
    );

    if (exactDuplicates.rows.length > 0) {
      console.log('\n❌ Exact duplicate usernames found:');
      exactDuplicates.rows.forEach(row => {
        console.log(
          `   "${row.username}" appears ${row.count} times (users: ${row.user_ids})`,
        );
      });
    } else {
      console.log('\n✅ No exact duplicate usernames found');
    }

    if (caseInsensitiveDuplicates.rows.length > 0) {
      console.log('\n⚠️  Case-insensitive duplicate usernames found:');
      caseInsensitiveDuplicates.rows.forEach(row => {
        console.log(
          `   "${row.normalized_username}" has ${row.count} variants: ${row.variants}`,
        );
      });
    } else {
      console.log('\n✅ No case-insensitive duplicate usernames found');
    }

    // Check for reserved usernames
    const reservedUsernames = [
      'admin',
      'administrator',
      'root',
      'system',
      'api',
      'www',
      'gallery',
      'marketplace',
      'cards',
      'card',
      'profile',
      'profiles',
    ];

    const reservedUsed = await db.execute(sql`
      SELECT username, user_id
      FROM users
      WHERE LOWER(TRIM(username)) = ANY(${reservedUsernames})
      ORDER BY username;
    `);

    if (reservedUsed.rows.length > 0) {
      console.log('\n⚠️  Reserved usernames in use:');
      reservedUsed.rows.forEach(row => {
        console.log(`   "${row.username}" (user: ${row.user_id})`);
      });
    } else {
      console.log('\n✅ No reserved usernames in use');
    }

    const hasDuplicates =
      exactDuplicates.rows.length > 0 ||
      caseInsensitiveDuplicates.rows.length > 0;

    if (hasDuplicates) {
      console.log(
        '\n🚨 Migration will resolve duplicates by appending numbers',
      );
      console.log('   Example: "admin" and "Admin" → "admin" and "Admin_1"');
      console.log('\n✅ Safe to run migration');
    } else {
      console.log('\n🎉 Database is ready for username unique constraint!');
    }
  } catch (error) {
    console.error('❌ Error checking username duplicates:', error);
    exit(1);
  }
}

// Run the check
checkUsernameDuplicates()
  .then(() => {
    console.log('\n✨ Username duplicate check completed');
    process.exit(0);
  })
  .catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });

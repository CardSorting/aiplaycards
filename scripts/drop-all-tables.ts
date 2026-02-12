import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function dropAllTables() {
  console.log('🗑️  Dropping all database tables...');

  try {
    // Get all table names first
    const tables = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename NOT LIKE 'pg_%'
      AND tablename NOT LIKE 'sql_%'
    `);

    console.log(`Found ${tables.rows.length} tables to drop`);

    // Drop all tables
    for (const row of tables.rows) {
      const tableName = row.tablename;
      console.log(`Dropping table: ${tableName}`);
      await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
    }

    // Also drop any enums that might exist
    const enums = await db.execute(sql`
      SELECT typname
      FROM pg_type
      WHERE typtype = 'e'
      AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    `);

    console.log(`Found ${enums.rows.length} enums to drop`);
    for (const row of enums.rows) {
      const enumName = row.typname;
      console.log(`Dropping enum: ${enumName}`);
      try {
        await db.execute(sql.raw(`DROP TYPE IF EXISTS "${enumName}" CASCADE`));
      } catch (error) {
        console.log(`Failed to drop enum ${enumName}, may not exist: ${error.message}`);
      }
    }

    // Also try dropping specific enum types that might be left
    const potentialEnums = [
      'pack_claim_type',
      'pack_rotation_strategy',
      'pack_status',
      'pack_type'
    ];

    console.log('Dropping specific enum types...');
    for (const enumName of potentialEnums) {
      try {
        await db.execute(sql.raw(`DROP TYPE IF EXISTS "${enumName}" CASCADE`));
        console.log(`Dropped enum: ${enumName}`);
      } catch (error) {
        console.log(`Enum ${enumName} doesn't exist or couldn't be dropped: ${error.message}`);
      }
    }

    console.log('✅ All tables and enums dropped successfully!');
  } catch (error) {
    console.error('❌ Failed to drop tables:', error);
    process.exit(1);
  }
}

dropAllTables().then(() => process.exit(0));

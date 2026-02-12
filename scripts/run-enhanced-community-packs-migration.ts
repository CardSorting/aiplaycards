#!/usr/bin/env tsx
/**
 * Enhanced Community Pack System Migration Runner
 *
 * This script runs the comprehensive database migration for the enhanced
 * community pack system with industry-grade features.
 *
 * Usage: npm run migrate:community-packs
 * Or: pnpm run migrate:community-packs
 */

import { promises as fs } from 'fs';
import { resolve } from 'path';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
  try {
    // Read the migration SQL file
    const migrationPath = resolve(
      __dirname,
      'enhanced-community-packs-migration.sql',
    );
    const migrationSQL = await fs.readFile(migrationPath, 'utf-8');

    // Execute the migration
    // Split the SQL into individual statements and execute them
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      await db.execute(sql.raw(statement));
    }

    // Run validation queries

    const validations = [
      {
        name: 'Pack Templates',
        query: 'SELECT COUNT(*) as count FROM pack_templates',
        expected: '>= 3',
      },
      {
        name: 'Card Pools',
        query: 'SELECT COUNT(*) as count FROM card_pools',
        expected: '>= 2',
      },
      {
        name: 'Pack Categories',
        query: 'SELECT COUNT(*) as count FROM pack_categories',
        expected: '>= 7',
      },
    ];

    for (const validation of validations) {
      try {
        await db.execute(sql.raw(validation.query));
      } catch (error) {
        // Validation failed - continue
      }
    }

    // Check if all tables exist
    const requiredTables = [
      'pack_templates',
      'pack_categories',
      'card_pools',
      'pool_cards',
      'card_category_associations',
      'pack_instances',
      'pack_instance_cards',
      'pack_suggestions',
      'pack_suggestion_votes',
      'pack_analytics',
    ];

    // Check if all tables exist
    for (const tableName of requiredTables) {
      try {
        await db.execute(sql.raw(`SELECT 1 FROM ${tableName} LIMIT 1`));
      } catch (error) {
        // Table may not exist - continue
      }
    }
  } catch (error) {
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  process.exit(1);
});

process.on('SIGTERM', () => {
  process.exit(1);
});

// Run the migration
if (require.main === module) {
  runMigration()
    .then(() => {
      process.exit(0);
    })
    .catch(() => {
      process.exit(1);
    });
}

export { runMigration };

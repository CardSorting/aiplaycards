#!/usr/bin/env node

import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🔄 Starting schema migration process...');

const runCommand = (command, args, description) => {
  return new Promise((resolve, reject) => {
    console.log(`\n📋 ${description}`);

    const child = spawn(command, args, {
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd: process.cwd(),
    });

    let hasError = false;

    child.on('error', error => {
      console.error(`❌ Error running ${description}:`, error.message);
      hasError = true;
      reject(error);
    });

    child.on('close', code => {
      if (code === 0) {
        console.log(`✅ ${description} completed successfully`);
        resolve(code);
      } else {
        console.error(`❌ ${description} failed with exit code ${code}`);
        hasError = true;
        reject(new Error(`Command exited with code ${code}`));
      }
    });

    // Set a timeout to avoid hanging processes
    setTimeout(() => {
      if (!child.killed) {
        console.error(`⏰ ${description} timed out - killing process`);
        child.kill('SIGTERM');
        setTimeout(() => {
          if (!child.killed) {
            child.kill('SIGKILL');
          }
        }, 5000);
        reject(new Error('Command timed out'));
      }
    }, 120000); // 2 minute timeout per command
  });
};

const migrateSchema = async () => {
  try {
    // Step 1: Generate migration files
    await runCommand(
      'npx',
      ['drizzle-kit', 'generate'],
      'Generating migration files',
    );

    // Step 2: Check if migration files were created
    const drizzleDir = path.join(process.cwd(), 'drizzle');
    const files = fs
      .readdirSync(drizzleDir)
      .filter(file => file.endsWith('.sql') && file !== 'schema.ts');

    if (files.length === 0) {
      console.log('ℹ️  No new migrations needed - schema is up to date');
      return;
    }

    console.log(`📄 Generated ${files.length} migration file(s):`, files);

    // Step 3: Run migrations
    await runCommand(
      'npx',
      ['drizzle-kit', 'migrate'],
      'Running database migrations',
    );

    // Step 4: Regenerate schema.ts to sync with database
    console.log('\n🔄 Regenerating schema.ts file...');

    // Use introspection to update schema.ts
    const introspect = spawn('npx', ['drizzle-kit', 'introspect'], {
      stdio: 'inherit',
      cwd: process.cwd(),
    });

    await new Promise((resolve, reject) => {
      introspect.on('close', code => {
        if (code === 0) {
          console.log('✅ Schema introspection completed');
          resolve();
        } else {
          console.error('❌ Schema introspection failed');
          reject(new Error('Introspect failed'));
        }
      });

      introspect.on('error', reject);
    });

    console.log('\n🎉 Schema migration process completed successfully!');
    console.log(
      '💡 All tables, constraints, and relationships should now be synchronized',
    );
  } catch (error) {
    console.error('\n❌ Schema migration failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('  1. Ensure DATABASE_URL environment variable is set');
    console.log('  2. Check database connectivity');
    console.log('  3. Verify user has sufficient permissions');
    console.log('  4. Check for foreign key constraint conflicts');
    console.log('  5. Consider backing up data before retrying');
    process.exit(1);
  }
};

// Run the migration process
migrateSchema();

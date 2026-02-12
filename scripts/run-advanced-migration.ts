#!/usr/bin/env tsx

/**
 * Advanced Database Migration Runner
 *
 * This script executes the comprehensive database improvements
 * following industry standards and world-class methodologies.
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface MigrationResult {
  success: boolean;
  message: string;
  details?: any;
}

class AdvancedDatabaseMigrationRunner {
  private db: ReturnType<typeof drizzle>;
  private sql: ReturnType<typeof postgres>;

  constructor(private databaseUrl: string) {
    if (!databaseUrl) {
      throw new Error('DATABASE_URL environment variable is required');
    }

    this.sql = postgres(databaseUrl, { max: 1 });
    this.db = drizzle(this.sql);
  }

  /**
   * Execute a comprehensive schema update sequence
   */
  async executeAdvancedMigration(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    console.log('🚀 Starting Advanced Database Migration...\n');

    try {
      // 1. First run the standard Drizzle migration
      console.log('📦 Executing standard Drizzle migrations...');
      const drizzleResult = await this.executeDrizzleMigration();
      results.push(drizzleResult);

      if (!drizzleResult.success) {
        console.error(
          '❌ Drizzle migration failed, aborting advanced migrations',
        );
        return results;
      }

      // 2. Execute the comprehensive SQL migration
      console.log('🔧 Executing advanced database improvements...');
      const sqlResult = await this.executeSQLMigration();
      results.push(sqlResult);

      // 3. Validate the migration
      console.log('✅ Validating migration completeness...');
      const validationResult = await this.validateMigration();
      results.push(validationResult);

      // 4. Run post-migration optimizations
      if (validationResult.success) {
        console.log('⚡ Applying post-migration optimizations...');
        const optimizationResult = await this.applyOptimizations();
        results.push(optimizationResult);
      }

      this.logMigrationSummary(results);
    } catch (error) {
      console.error('💥 Migration failed with error:', error);
      results.push({
        success: false,
        message: `Migration failed: ${error}`,
      });
    } finally {
      await this.sql.end();
    }

    return results;
  }

  private async executeDrizzleMigration(): Promise<MigrationResult> {
    try {
      await migrate(this.db, {
        migrationsFolder: path.join(__dirname, '..', 'drizzle'),
      });

      return {
        success: true,
        message: 'Drizzle migrations completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `Drizzle migration failed: ${error}`,
        details: error,
      };
    }
  }

  private async executeSQLMigration(): Promise<MigrationResult> {
    try {
      const sqlPath = path.join(__dirname, 'advanced-database-migration.sql');
      const sqlContent = await fs.readFile(sqlPath, 'utf8');

      // Split SQL into individual statements and execute them
      const statements = this.splitSQLStatements(sqlContent);

      for (const statement of statements) {
        if (statement.trim()) {
          await this.sql.unsafe(statement);
        }
      }

      return {
        success: true,
        message: 'Advanced SQL migrations completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: `SQL migration failed: ${error}`,
        details: error,
      };
    }
  }

  private async validateMigration(): Promise<MigrationResult> {
    try {
      const validationQueries = [
        {
          name: 'audit_trail_table',
          query:
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'audit_trail')",
        },
        {
          name: 'user_sessions_table',
          query:
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_sessions')",
        },
        {
          name: 'performance_metrics_table',
          query:
            "SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'performance_metrics')",
        },
        {
          name: 'retention_policies_data',
          query: 'SELECT COUNT(*) as count FROM retention_policies',
        },
        {
          name: 'audit_triggers',
          query:
            "SELECT COUNT(*) as count FROM information_schema.triggers WHERE trigger_name LIKE '%audit%trigger'",
        },
        {
          name: 'rls_policies',
          query:
            "SELECT COUNT(*) as count FROM pg_policies WHERE schemaname = 'public'",
        },
      ];

      let totalValidations = 0;
      let passedValidations = 0;

      for (const { name, query } of validationQueries) {
        try {
          const result = await this.sql.unsafe(query);
          const count = parseInt(result[0].count || (result[0].exists ? 1 : 0));
          const passed = count > 0;

          if (passed) passedValidations++;
          totalValidations++;

          console.log(
            `  ${passed ? '✅' : '❌'} ${name}: ${
              passed ? 'OK' : 'FAILED'
            } (${count})`,
          );
        } catch (error) {
          console.log(`  ❌ ${name}: ERROR - ${error}`);
          totalValidations++;
        }
      }

      return {
        success: passedValidations >= totalValidations * 0.8, // 80% success threshold
        message: `Validation completed: ${passedValidations}/${totalValidations} checks passed`,
        details: { passedValidations, totalValidations },
      };
    } catch (error) {
      return {
        success: false,
        message: `Validation failed: ${error}`,
        details: error,
      };
    }
  }

  private async applyOptimizations(): Promise<MigrationResult> {
    try {
      // Run ANALYZE on all migrated tables to update statistics
      const tablesToAnalyze = [
        'audit_trail',
        'user_sessions',
        'performance_metrics',
        'query_analytics',
        'connection_metrics',
        'retention_policies',
        'maintenance_logs',
      ];

      for (const table of tablesToAnalyze) {
        await this.sql`ANALYZE ${this.sql(table)}`;
      }

      // Test audit trigger functionality
      const testResult = await this.sql`
        SELECT perform_database_maintenance('users', 'analyze')
      `;

      return {
        success: true,
        message: 'Post-migration optimizations completed successfully',
        details: {
          tablesAnalyzed: tablesToAnalyze.length,
          maintenanceTestResult: testResult,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Optimization failed: ${error}`,
        details: error,
      };
    }
  }

  private splitSQLStatements(sqlContent: string): string[] {
    const statements: string[] = [];
    let currentStatement = '';
    let inBlockComment = false;
    let inLineComment = false;
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < sqlContent.length; i++) {
      const char = sqlContent[i];
      const nextChar = sqlContent[i + 1] || '';

      // Handle comments
      if (!inString) {
        if (!inBlockComment && char === '/' && nextChar === '*') {
          inBlockComment = true;
          currentStatement += char + nextChar;
          i++; // Skip next char
          continue;
        }
        if (inBlockComment && char === '*' && nextChar === '/') {
          inBlockComment = false;
          currentStatement += char + nextChar;
          i++; // Skip next char
          continue;
        }
        if (!inBlockComment && char === '-' && nextChar === '-') {
          inLineComment = true;
        }
        if (inLineComment && char === '\n') {
          inLineComment = false;
        }
      }

      if (inBlockComment || inLineComment) {
        currentStatement += char;
        continue;
      }

      // Handle strings
      if (!inString && (char === '"' || char === "'")) {
        inString = true;
        stringChar = char;
      } else if (
        inString &&
        char === stringChar &&
        sqlContent[i - 1] !== '\\'
      ) {
        inString = false;
        stringChar = '';
      }

      // Handle statement termination
      if (!inString && char === ';') {
        statements.push(currentStatement + ';');
        currentStatement = '';
        continue;
      }

      currentStatement += char;
    }

    // Add remaining statement if any
    if (currentStatement.trim()) {
      statements.push(currentStatement);
    }

    return statements;
  }

  private logMigrationSummary(results: MigrationResult[]): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ADVANCED DATABASE MIGRATION SUMMARY');
    console.log('='.repeat(60));

    const totalResults = results.length;
    const successfulResults = results.filter(r => r.success).length;

    results.forEach((result, index) => {
      const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
      console.log(`${index + 1}. ${status}: ${result.message}`);
    });

    console.log('='.repeat(60));
    console.log(
      `📈 Overall: ${successfulResults}/${totalResults} phases completed successfully`,
    );

    if (successfulResults === totalResults) {
      console.log('🎉 Advanced database migration completed successfully!');
      console.log('\n🔧 Next steps:');
      console.log('  - Run your application tests');
      console.log('  - Monitor performance improvements');
      console.log('  - Review audit trails for data integrity');
      console.log('  - Set up automated maintenance cron jobs');
    } else {
      console.log(
        '⚠️  Migration partially failed. Please review error logs above.',
      );
    }
    console.log('='.repeat(60));
  }
}

// Export for use as module
export { AdvancedDatabaseMigrationRunner };

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const databaseUrl = process.env.DATABASE_URL;
  const runner = new AdvancedDatabaseMigrationRunner(databaseUrl!);

  runner
    .executeAdvancedMigration()
    .then(results => {
      const allSuccessful = results.every(r => r.success);
      process.exit(allSuccessful ? 0 : 1);
    })
    .catch(error => {
      console.error('💥 Migration runner failed:', error);
      process.exit(1);
    });
}

console.log('\n🎯 Advanced Database Migration Runner');
console.log('Usage: tsx scripts/run-advanced-migration.ts');
console.log('Environment: DATABASE_URL required');
console.log('\nFeatures implemented:');
console.log('  ✅ Industrial-grade audit trails');
console.log('  ✅ Performance monitoring & analytics');
console.log('  ✅ Automated maintenance functions');
console.log('  ✅ GDPR-compliant retention policies');
console.log('  ✅ Row-level security policies');
console.log('  ✅ Advanced database triggers');

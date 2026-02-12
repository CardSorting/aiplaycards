import 'dotenv/config';
import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('[reset-booster-drops] Truncating booster tables...');
  try {
    await db.execute(
      sql`TRUNCATE TABLE booster_jobs, booster_drops RESTART IDENTITY CASCADE;`,
    );
    console.log(
      '[reset-booster-drops] Done. All drops and related jobs have been cleared.',
    );
  } catch (e) {
    console.error('[reset-booster-drops] Failed to truncate tables:', e);
    process.exit(1);
  }
}

main().then(() => process.exit(0));

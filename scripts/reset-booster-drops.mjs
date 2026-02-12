import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[reset-booster-drops] DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = neon(url);
  console.log('[reset-booster-drops] Truncating booster tables...');
  try {
    await sql`TRUNCATE TABLE booster_jobs, booster_drops RESTART IDENTITY CASCADE;`;
    console.log(
      '[reset-booster-drops] Done. All drops and related jobs have been cleared.',
    );
  } catch (e) {
    console.error('[reset-booster-drops] Failed to truncate tables:', e);
    process.exit(1);
  }
}

main().then(() => process.exit(0));

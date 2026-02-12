import 'dotenv/config';
import { neon } from '@neondatabase/serverless';

const PACKS = [
  { slug: 'eldersigil', name: 'Eldersigil' },
  { slug: 'emberforged', name: 'Emberforged' },
  { slug: 'tidebound', name: 'Tidebound' },
  { slug: 'aetherwave', name: 'Aetherwave' },
  { slug: 'nightfall', name: 'Nightfall' },
  { slug: 'verdantwild', name: 'Verdantwild' },
  { slug: 'stormcall', name: 'Stormcall' },
  { slug: 'astralbound', name: 'Astralbound' },
];

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('[seed-drops-for-all-packs] DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = neon(url);

  const defaultStatus = process.env.SEED_ALL_STATUS || 'active';
  const defaultTotal = Number(process.env.SEED_ALL_TOTAL || 100);
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (const pack of PACKS) {
    const slug = `${pack.slug}-${dateStamp}`;
    console.log(`[seed] Upserting ${slug}`);
    await sql`
      INSERT INTO booster_drops (slug, pack_slug, name, status, total_supply, remaining_supply, starts_at, ends_at, created_at, updated_at)
      VALUES (${slug}, ${pack.slug}, ${
      pack.name + ' Drop'
    }, ${defaultStatus}, ${defaultTotal}, ${defaultTotal}, NULL, NULL, NOW(), NOW())
      ON CONFLICT (slug) DO UPDATE SET
        pack_slug = EXCLUDED.pack_slug,
        name = EXCLUDED.name,
        status = EXCLUDED.status,
        total_supply = EXCLUDED.total_supply,
        remaining_supply = EXCLUDED.remaining_supply,
        starts_at = NULL,
        ends_at = NULL,
        updated_at = NOW();
    `;
  }
  console.log('[seed] Done.');
}

main().then(() => process.exit(0));

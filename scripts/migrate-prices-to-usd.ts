import 'dotenv/config';
import { db } from '../src/db';
import { marketplaceListings } from '../src/db/schema/marketplace';
import { sql } from 'drizzle-orm';

async function main() {
  console.log('Migrating marketplace listing prices to USD...');

  // Update all existing listings to have USD prices based on credit prices
  const result = await db.execute(sql`
    UPDATE marketplace_listings 
    SET price_usd = price_credits * 0.01, 
        updated_at = CURRENT_TIMESTAMP
    WHERE price_usd IS NULL OR price_usd = price_credits * 0.04
  `);

  console.log(
    `Updated ${result.rowCount || 0} marketplace listings with USD prices`,
  );

  // Show some examples
  const examples = await db
    .select({
      id: marketplaceListings.id,
      priceCredits: marketplaceListings.priceCredits,
    })
    .from(marketplaceListings)
    .limit(5);

  console.log('Example conversions:');
  examples.forEach(listing => {
    console.log(`Listing ${listing.id}: ${listing.priceCredits} credits`);
  });
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

import 'dotenv/config';
import { db } from '../src/db';
import { boosterDrops } from '../src/db/schema/booster-drops';
import { eq } from 'drizzle-orm';

async function main() {
  const slug = process.env.SEED_DROP_SLUG || 'launch';
  const packSlug = process.env.SEED_DROP_PACK_SLUG || undefined;
  const name = process.env.SEED_DROP_NAME || 'Launch Drop';
  const total = Number(process.env.SEED_DROP_TOTAL || 100);
  const status = (process.env.SEED_DROP_STATUS || 'active') as
    | 'scheduled'
    | 'active'
    | 'sold_out'
    | 'ended';
  const startsAtEnv = process.env.SEED_DROP_STARTS_AT; // ISO string or empty
  const endsAtEnv = process.env.SEED_DROP_ENDS_AT; // ISO string or empty
  let startsAt = startsAtEnv ? new Date(startsAtEnv) : undefined;
  let endsAt = endsAtEnv ? new Date(endsAtEnv) : undefined;
  // Defaults: if scheduled and no start, start in N minutes; also set a default duration
  if (status === 'scheduled' && !startsAt) {
    const minutes = Number(process.env.SEED_DROP_STARTS_IN_MIN || 60);
    startsAt = new Date(Date.now() + minutes * 60 * 1000);
  }
  if (!endsAt && startsAt) {
    const durationMin = Number(process.env.SEED_DROP_DURATION_MIN || 120);
    endsAt = new Date(startsAt.getTime() + durationMin * 60 * 1000);
  }
  const boosterQueueSize = process.env.SEED_DROP_QUEUE_SIZE
    ? Number(process.env.SEED_DROP_QUEUE_SIZE)
    : undefined;
  const weightsCommon = process.env.SEED_DROP_WEIGHT_COMMON
    ? Number(process.env.SEED_DROP_WEIGHT_COMMON)
    : undefined;
  const weightsUncommon = process.env.SEED_DROP_WEIGHT_UNCOMMON
    ? Number(process.env.SEED_DROP_WEIGHT_UNCOMMON)
    : undefined;
  const weightsRare = process.env.SEED_DROP_WEIGHT_RARE
    ? Number(process.env.SEED_DROP_WEIGHT_RARE)
    : undefined;
  const guaranteeRareEvery = process.env.SEED_DROP_GUARANTEE_RARE_EVERY
    ? Number(process.env.SEED_DROP_GUARANTEE_RARE_EVERY)
    : undefined;

  const metadata: any = {};
  if (boosterQueueSize) metadata.boosterQueueSize = boosterQueueSize;
  if (weightsCommon != null || weightsUncommon != null || weightsRare != null) {
    metadata.rarityWeights = {
      ...(weightsCommon != null ? { common: weightsCommon } : {}),
      ...(weightsUncommon != null ? { uncommon: weightsUncommon } : {}),
      ...(weightsRare != null ? { rare: weightsRare } : {}),
    };
  }
  if (guaranteeRareEvery) metadata.guaranteeRareEvery = guaranteeRareEvery;

  const existing = await db
    .select()
    .from(boosterDrops)
    .where(eq(boosterDrops.slug, slug))
    .limit(1);
  if (existing[0]) {
    await db
      .update(boosterDrops)
      .set({
        name,
        packSlug,
        status,
        totalSupply: total,
        remainingSupply: total,
        startsAt: startsAt as any,
        endsAt: endsAt as any,
        metadata: Object.keys(metadata).length
          ? metadata
          : existing[0].metadata,
        updatedAt: new Date(),
      })
      .where(eq(boosterDrops.id, existing[0].id));
    console.log(
      `Updated existing drop '${slug}' to status='${status}' with total=${total}`,
    );
  } else {
    await db.insert(boosterDrops).values({
      slug,
      packSlug,
      name,
      status,
      totalSupply: total,
      remainingSupply: total,
      startsAt: startsAt as any,
      endsAt: endsAt as any,
      metadata: Object.keys(metadata).length ? metadata : undefined,
    });
    console.log(
      `Created drop '${slug}' status='${status}' with total=${total}`,
    );
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

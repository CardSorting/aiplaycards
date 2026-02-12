import 'dotenv/config';
import { db } from '../src/db';
import { boosterDrops } from '../src/db/schema/booster-drops';
import { PACKS } from '../src/features/booster/packs';
import { eq } from 'drizzle-orm';

async function upsertDrop(params: {
  slug: string;
  packSlug: string;
  name: string;
  total: number;
  status: 'scheduled' | 'active' | 'sold_out' | 'ended';
  startsAt?: Date;
  endsAt?: Date;
  metadata?: any;
}) {
  const existing = await db
    .select()
    .from(boosterDrops)
    .where(eq(boosterDrops.slug, params.slug))
    .limit(1);

  if (existing[0]) {
    await db
      .update(boosterDrops)
      .set({
        name: params.name,
        packSlug: params.packSlug,
        status: params.status,
        totalSupply: params.total,
        remainingSupply: params.total,
        startsAt: params.startsAt as any,
        endsAt: params.endsAt as any,
        metadata: params.metadata ?? existing[0].metadata,
        updatedAt: new Date(),
      })
      .where(eq(boosterDrops.id, existing[0].id));
    console.log(
      `Updated drop '${params.slug}' (pack='${params.packSlug}') → status='${params.status}' total=${params.total}`,
    );
  } else {
    await db.insert(boosterDrops).values({
      slug: params.slug,
      packSlug: params.packSlug,
      name: params.name,
      status: params.status,
      totalSupply: params.total,
      remainingSupply: params.total,
      startsAt: params.startsAt as any,
      endsAt: params.endsAt as any,
      metadata: params.metadata,
    });
    console.log(
      `Created drop '${params.slug}' (pack='${params.packSlug}') → status='${params.status}' total=${params.total}`,
    );
  }
}

async function main() {
  const defaultTotal = Number(process.env.SEED_ALL_TOTAL || 100);
  const defaultStatus = (process.env.SEED_ALL_STATUS || 'scheduled') as
    | 'scheduled'
    | 'active'
    | 'sold_out'
    | 'ended';
  let defaultStartsAt = process.env.SEED_ALL_STARTS_AT
    ? new Date(process.env.SEED_ALL_STARTS_AT)
    : undefined;
  let defaultEndsAt = process.env.SEED_ALL_ENDS_AT
    ? new Date(process.env.SEED_ALL_ENDS_AT)
    : undefined;

  // Optional rarity distribution metadata shared across all
  const boosterQueueSize = process.env.SEED_ALL_QUEUE_SIZE
    ? Number(process.env.SEED_ALL_QUEUE_SIZE)
    : undefined;
  const weightsCommon = process.env.SEED_ALL_WEIGHT_COMMON
    ? Number(process.env.SEED_ALL_WEIGHT_COMMON)
    : undefined;
  const weightsUncommon = process.env.SEED_ALL_WEIGHT_UNCOMMON
    ? Number(process.env.SEED_ALL_WEIGHT_UNCOMMON)
    : undefined;
  const weightsRare = process.env.SEED_ALL_WEIGHT_RARE
    ? Number(process.env.SEED_ALL_WEIGHT_RARE)
    : undefined;
  const guaranteeRareEvery = process.env.SEED_ALL_GUARANTEE_RARE_EVERY
    ? Number(process.env.SEED_ALL_GUARANTEE_RARE_EVERY)
    : undefined;
  const sharedMetadata: any = {};
  if (boosterQueueSize) sharedMetadata.boosterQueueSize = boosterQueueSize;
  if (weightsCommon != null || weightsUncommon != null || weightsRare != null) {
    sharedMetadata.rarityWeights = {
      ...(weightsCommon != null ? { common: weightsCommon } : {}),
      ...(weightsUncommon != null ? { uncommon: weightsUncommon } : {}),
      ...(weightsRare != null ? { rare: weightsRare } : {}),
    };
  }
  if (guaranteeRareEvery)
    sharedMetadata.guaranteeRareEvery = guaranteeRareEvery;

  // If scheduled and no explicit time, default to start in N minutes and last M minutes
  if (defaultStatus === 'scheduled' && !defaultStartsAt) {
    const minutes = Number(process.env.SEED_ALL_STARTS_IN_MIN || 60);
    defaultStartsAt = new Date(Date.now() + minutes * 60 * 1000);
  }
  if (!defaultEndsAt && defaultStartsAt) {
    const durationMin = Number(process.env.SEED_ALL_DURATION_MIN || 120);
    defaultEndsAt = new Date(
      defaultStartsAt.getTime() + durationMin * 60 * 1000,
    );
  }

  // For each pack, seed a drop with a slug convention: `${packSlug}-${YYYYMMDD}`
  const dateStamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');

  for (const pack of PACKS) {
    const dropSlug = `${pack.slug}-${dateStamp}`;
    await upsertDrop({
      slug: dropSlug,
      packSlug: pack.slug,
      name: `${pack.name} Drop`,
      total: defaultTotal,
      status: defaultStatus,
      startsAt: defaultStartsAt,
      endsAt: defaultEndsAt,
      metadata: Object.keys(sharedMetadata).length ? sharedMetadata : undefined,
    });
  }
}

main()
  .then(() => process.exit(0))
  .catch(e => {
    console.error(e);
    process.exit(1);
  });

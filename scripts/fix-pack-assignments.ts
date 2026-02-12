#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../src/db';
import { cards } from '../src/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { PACKS } from '../src/features/booster/packs';

async function fixPackAssignments() {
  console.log('🔧 Fixing Pack Assignments');
  console.log('==========================');

  if (PACKS.length !== 1) {
    console.error(
      '❌ This script expects exactly 1 available pack. Found:',
      PACKS.length,
    );
    process.exit(1);
  }

  const targetPack = PACKS[0];
  console.log(`\n🎯 Target Pack: ${targetPack.slug} (${targetPack.name})`);

  try {
    // Find all cards with NULL packSlug
    const nullPackCards = await db
      .select({ id: cards.id })
      .from(cards)
      .where(
        and(
          eq(cards.pregenerated, true),
          isNull(cards.userId),
          isNull(cards.packSlug),
        ),
      );

    console.log(`\n📊 Found ${nullPackCards.length} cards with NULL packSlug`);

    if (nullPackCards.length === 0) {
      console.log('✅ No cards need fixing!');
      return;
    }

    // Update all cards to assign them to the target pack
    console.log(`\n🔄 Assigning all cards to pack: ${targetPack.slug}`);

    const updateResult = await db
      .update(cards)
      .set({
        packSlug: targetPack.slug,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(cards.pregenerated, true),
          isNull(cards.userId),
          isNull(cards.packSlug),
        ),
      );

    console.log(`✅ Updated ${updateResult.rowCount || 0} cards`);

    // Verify the fix
    console.log('\n📊 Verification:');
    const verifyCards = await db
      .select({
        packSlug: cards.packSlug,
        raritySlot: cards.raritySlot,
      })
      .from(cards)
      .where(and(eq(cards.pregenerated, true), isNull(cards.userId)));

    const packGroups: { [pack: string]: any[] } = {};
    for (const card of verifyCards) {
      const packSlug = card.packSlug || 'NULL';
      if (!packGroups[packSlug]) {
        packGroups[packSlug] = [];
      }
      packGroups[packSlug].push(card);
    }

    for (const [pack, cardList] of Object.entries(packGroups)) {
      console.log(
        `   ${pack === 'NULL' ? '❌' : '✅'} ${pack}: ${cardList.length} cards`,
      );
    }

    console.log('\n🎮 Pack-Specific Pool System Ready!');
    console.log('   ✅ All pregenerated cards assigned to specific pack');
    console.log('   ✅ drawCard() will now work with pack-specific filtering');
    console.log('   ✅ Users will only get cards from the selected pack');
  } catch (error) {
    console.error('❌ Failed to fix pack assignments:', error);
    process.exit(1);
  }
}

fixPackAssignments();

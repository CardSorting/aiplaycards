#!/usr/bin/env tsx

import 'dotenv/config';
import { db } from '../src/db';
import { cards } from '../src/db/schema';
import { and, eq, isNull } from 'drizzle-orm';

async function checkPackAssignments() {
  console.log('📦 Pack Assignment Check');
  console.log('========================');

  try {
    // Get all pregenerated cards with their pack assignments
    const pregeneratedCards = await db
      .select({
        packSlug: cards.packSlug,
        raritySlot: cards.raritySlot,
        name: cards.name,
      })
      .from(cards)
      .where(and(eq(cards.pregenerated, true), isNull(cards.userId)));

    console.log(`\n📊 Found ${pregeneratedCards.length} pregenerated cards`);

    // Group by pack
    const packGroups: { [pack: string]: any[] } = {};
    let nullPackCount = 0;

    for (const card of pregeneratedCards) {
      const packSlug = card.packSlug || 'NULL';
      if (card.packSlug === null) {
        nullPackCount++;
      }
      if (!packGroups[packSlug]) {
        packGroups[packSlug] = [];
      }
      packGroups[packSlug].push(card);
    }

    console.log('\n📋 Cards by Pack:');
    for (const [pack, cardList] of Object.entries(packGroups)) {
      console.log(
        `\n   ${pack === 'NULL' ? '❌ NULL (needs fixing)' : '✅ ' + pack}: ${
          cardList.length
        } cards`,
      );

      // Count by rarity
      const rarityCount: { [key: string]: number } = {};
      for (const card of cardList) {
        const rarity = card.raritySlot || 'unknown';
        rarityCount[rarity] = (rarityCount[rarity] || 0) + 1;
      }

      for (const [rarity, count] of Object.entries(rarityCount)) {
        console.log(`      ${rarity}: ${count} cards`);
      }
    }

    if (nullPackCount > 0) {
      console.log(`\n⚠️  Found ${nullPackCount} cards with NULL packSlug`);
      console.log(
        '   These cards are from the shared pool era and need pack assignment',
      );
      console.log('   They cannot be drawn by pack-specific pool system');
    }

    // Check current available packs
    const { PACKS } = await import('../src/features/booster/packs');
    console.log(`\n🎯 Currently Available Packs: ${PACKS.length}`);
    for (const pack of PACKS) {
      console.log(`   • ${pack.slug} (${pack.name})`);
    }
  } catch (error) {
    console.error('❌ Failed to check pack assignments:', error);
    process.exit(1);
  }
}

checkPackAssignments();

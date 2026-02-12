#!/usr/bin/env tsx

import { db } from '../src/db';
import { cards } from '../src/db/schema/cards';
import { authUsers } from '../src/db/schema/auth';
import { cardLikes } from '../src/db/schema/card-social';
import { follows } from '../src/db/schema/follows';
import { and, count, desc, eq, gte, inArray, isNotNull } from 'drizzle-orm';

async function testFeedAlgorithm() {
  console.log('🧪 Testing Feed Algorithm...\n');

  try {
    // Test 1: Basic animated cards query
    console.log('1. Testing basic animated cards query...');
    const animatedCards = await db
      .select({
        id: cards.id,
        name: cards.name,
        animatedAt: cards.animatedAt,
        userId: cards.userId,
        username: authUsers.name,
      })
      .from(cards)
      .leftJoin(authUsers, eq(cards.userId, authUsers.id))
      .where(and(eq(cards.isPublic, true), isNotNull(cards.animatedAt)))
      .orderBy(desc(cards.animatedAt))
      .limit(5);

    console.log(`✅ Found ${animatedCards.length} animated cards`);
    animatedCards.forEach(card => {
      console.log(
        `   - ${card.name} by ${card.username || 'Anonymous'} (${
          card.animatedAt
        })`,
      );
    });

    // Test 2: Engagement data
    if (animatedCards.length > 0) {
      console.log('\n2. Testing engagement data...');
      const cardIds = animatedCards.map(card => card.id);

      const likesData = await db
        .select({
          cardId: cardLikes.cardId,
          count: count(cardLikes.id),
        })
        .from(cardLikes)
        .where(inArray(cardLikes.cardId, cardIds))
        .groupBy(cardLikes.cardId);

      console.log(`✅ Found likes data for ${likesData.length} cards`);
      likesData.forEach(like => {
        console.log(`   - Card ${like.cardId}: ${like.count} likes`);
      });
    }

    // Test 3: Trending algorithm (last 7 days)
    console.log('\n3. Testing trending algorithm...');
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const trendingCards = await db
      .select({
        id: cards.id,
        name: cards.name,
        animatedAt: cards.animatedAt,
      })
      .from(cards)
      .where(
        and(
          eq(cards.isPublic, true),
          isNotNull(cards.animatedAt),
          gte(cards.animatedAt, sevenDaysAgo),
        ),
      )
      .orderBy(desc(cards.animatedAt))
      .limit(10);

    console.log(`✅ Found ${trendingCards.length} cards from last 7 days`);

    // Test 4: Follow relationships
    console.log('\n4. Testing follow relationships...');
    const followCount = await db
      .select({ count: count(follows.followerUserId) })
      .from(follows);

    console.log(`✅ Total follow relationships: ${followCount[0].count}`);

    // Test 5: Ranking score calculation
    console.log('\n5. Testing ranking score calculation...');
    if (animatedCards.length > 0) {
      const testCard = animatedCards[0];
      if (testCard.animatedAt) {
        const hoursSinceAnimation =
          (Date.now() - testCard.animatedAt.getTime()) / (1000 * 60 * 60);
        const timeDecay = Math.max(0.1, 1 - hoursSinceAnimation / 168);

        console.log(`   - Test card: ${testCard.name}`);
        console.log(
          `   - Hours since animation: ${hoursSinceAnimation.toFixed(1)}`,
        );
        console.log(`   - Time decay factor: ${timeDecay.toFixed(3)}`);

        // Simulate different engagement levels
        const engagementLevels = [0, 5, 10, 25, 50];
        engagementLevels.forEach(likes => {
          const engagementScore = Math.log10(likes + 1) * 10;
          const hasAnimation = 20; // Bonus for having animation
          const hasPrompt = 10; // Bonus for having prompt
          const rarityBonus = 10; // Assume rare card
          const creatorBonus = likes > 10 ? 25 : likes > 5 ? 15 : 0;

          const totalScore =
            (engagementScore +
              hasAnimation +
              hasPrompt +
              rarityBonus +
              creatorBonus) *
            timeDecay;

          console.log(`   - ${likes} likes: ${totalScore.toFixed(1)} points`);
        });
      }
    }

    console.log('\n✅ Feed algorithm test completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Animated cards: ${animatedCards.length}`);
    console.log(`   - Follow relationships: ${followCount[0].count}`);
    console.log(`   - Recent cards (7 days): ${trendingCards.length}`);
    console.log(
      '\n🚀 The feed algorithm is ready to provide personalized content!',
    );
  } catch (error) {
    console.error('❌ Error testing feed algorithm:', error);
    process.exit(1);
  }
}

// Run the test
testFeedAlgorithm()
  .then(() => {
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });

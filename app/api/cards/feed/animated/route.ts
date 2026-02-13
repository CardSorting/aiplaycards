import { NextRequest, NextResponse } from 'next/server';
import {
  and,
  avg,
  count,
  desc,
  eq,
  gte,
  inArray,
  isNotNull,
  sql,
  sum,
} from 'drizzle-orm';
import { db } from '../../../../../src/db';
import { cards } from '../../../../../src/db/schema/cards';
import { users } from '../../../../../src/db/schema/users';
import { cardLikes } from '../../../../../src/db/schema/card-social';
import { follows } from '../../../../../src/db/schema/follows';

// Enhanced feed algorithm with modern methodologies
interface FeedCard {
  id: number;
  name: string;
  description: string;
  type: string;
  subtype: string;
  supertype: string;
  rarity: string;
  hitpoints: number;
  cardNumber: string;
  totalInSet: number;
  illustrator: string;
  dexEntry: string;
  dexStats: any;
  moves: any;
  ability: any;
  weakness: any;
  resistance: any;
  retreatCost: any;
  imageData: any;
  cardEditorState: any;
  animationUrl: string;
  animationKey: string;
  animationPrompt: string;
  animatedAt: string;
  createdAt: string;
  isPublic: boolean;
  userId: string;
  username: string;
  userAvatar: string;
  // Engagement metrics
  likesCount: number;
  isLiked: boolean;
  isFollowedUser: boolean;
  // Advanced metrics
  engagementVelocity: number;
  contentFreshness: number;
  creatorAuthority: number;
  // Ranking score
  rankingScore: number;
}

// Modern engagement velocity calculation
function calculateEngagementVelocity(
  likesCount: number,
  hoursSinceCreation: number,
): number {
  if (hoursSinceCreation === 0) return likesCount;
  return likesCount / Math.max(1, hoursSinceCreation);
}

// Content freshness score (based on Reddit's hot algorithm)
function calculateContentFreshness(hoursSinceCreation: number): number {
  const order = Math.log10(Math.max(Math.abs(hoursSinceCreation), 1));
  const sign = hoursSinceCreation > 0 ? 1 : -1;
  const seconds = hoursSinceCreation * 3600;
  return sign * order + seconds / 45000;
}

// Creator authority score based on historical performance
function calculateCreatorAuthority(
  totalLikes: number,
  totalCards: number,
  avgLikesPerCard: number,
  recentPerformance: number,
): number {
  const baseScore = Math.log10(totalLikes + 1) * 5;
  const consistencyBonus =
    totalCards > 0 ? Math.min(avgLikesPerCard / 10, 20) : 0;
  const recentBonus = recentPerformance * 2;
  return baseScore + consistencyBonus + recentBonus;
}

// Advanced time decay with multiple time windows
function calculateTimeDecay(hoursSinceCreation: number): number {
  // Multiple decay windows for different content types
  const shortTerm = Math.exp(-hoursSinceCreation / 24); // 1 day
  const mediumTerm = Math.exp(-hoursSinceCreation / 168); // 1 week
  const longTerm = Math.exp(-hoursSinceCreation / 720); // 1 month

  // Weighted combination based on content age
  if (hoursSinceCreation < 24) {
    return 0.7 * shortTerm + 0.3 * mediumTerm;
  } else if (hoursSinceCreation < 168) {
    return 0.5 * mediumTerm + 0.3 * shortTerm + 0.2 * longTerm;
  } else {
    return 0.6 * longTerm + 0.4 * mediumTerm;
  }
}

// User behavior modeling - content diversity
function calculateContentDiversity(
  userLikedTypes: Set<string>,
  cardType: string,
  userFollowedCreators: Set<string>,
  creatorId: string,
): number {
  let diversityScore = 0;

  // Encourage exploration of new content types
  if (!userLikedTypes.has(cardType)) {
    diversityScore += 15;
  }

  // Balance between followed and new creators
  if (userFollowedCreators.has(creatorId)) {
    diversityScore += 10; // Trusted creators
  } else {
    diversityScore += 20; // Discovery bonus
  }

  return diversityScore;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50);
    const cursor = searchParams.get('cursor');
    const sortBy = searchParams.get('sort') || 'ranked';
    const userId = searchParams.get('userId'); // For personalization
    const currentUserId = userId;

    // Enhanced base query with performance optimizations
    const baseQuery = db
      .select({
        // Card fields
        id: cards.id,
        name: cards.name,
        description: cards.description,
        type: cards.type,
        subtype: cards.subtype,
        supertype: cards.supertype,
        rarity: cards.rarity,
        hitpoints: cards.hitpoints,
        cardNumber: cards.cardNumber,
        totalInSet: cards.totalInSet,
        illustrator: cards.illustrator,
        dexStats: cards.dexStats,
        moves: cards.moves,
        ability: cards.ability,
        weakness: cards.weakness,
        resistance: cards.resistance,
        retreatCost: cards.retreatCost,
        imageData: cards.imageData,
        cardEditorState: cards.cardEditorState,
        animationUrl: cards.animationUrl,
        animationKey: cards.animationKey,
        animationPrompt: cards.animationPrompt,
        animatedAt: cards.animatedAt,
        createdAt: cards.createdAt,
        isPublic: cards.isPublic,
        userId: cards.userId,
        username: users.displayName,
        userAvatar: users.avatarUrl,
      })
      .from(cards)
      .leftJoin(users, eq(cards.userId, users.userId))
      .where(
        and(
          eq(cards.isPublic, true),
          isNotNull(cards.animatedAt),
          cursor ? sql`${cards.animatedAt} < ${new Date(cursor)}` : undefined,
        ),
      );

    // Apply different sorting based on sort parameter
    let result: any[] = [];
    switch (sortBy) {
      case 'latest':
        result = await baseQuery.orderBy(desc(cards.animatedAt)).limit(limit);
        break;

      case 'trending':
        // Enhanced trending with engagement velocity
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        result = await db
          .select({
            // Card fields
            id: cards.id,
            name: cards.name,
            description: cards.description,
            type: cards.type,
            subtype: cards.subtype,
            supertype: cards.supertype,
            rarity: cards.rarity,
            hitpoints: cards.hitpoints,
            cardNumber: cards.cardNumber,
            totalInSet: cards.totalInSet,
            illustrator: cards.illustrator,
            dexStats: cards.dexStats,
            moves: cards.moves,
            ability: cards.ability,
            weakness: cards.weakness,
            resistance: cards.resistance,
            retreatCost: cards.retreatCost,
            imageData: cards.imageData,
            cardEditorState: cards.cardEditorState,
            animationUrl: cards.animationUrl,
            animationKey: cards.animationKey,
            animationPrompt: cards.animationPrompt,
            animatedAt: cards.animatedAt,
            createdAt: cards.createdAt,
            isPublic: cards.isPublic,
            userId: cards.userId,
            username: users.displayName,
            userAvatar: users.avatarUrl,
          })
          .from(cards)
          .leftJoin(users, eq(cards.userId, users.userId))
          .where(
            and(
              eq(cards.isPublic, true),
              isNotNull(cards.animatedAt),
              gte(cards.animatedAt, sevenDaysAgo),
              cursor
                ? sql`${cards.animatedAt} < ${new Date(cursor)}`
                : undefined,
            ),
          )
          .orderBy(desc(cards.animatedAt))
          .limit(limit * 3); // Get more for velocity calculation
        break;

      case 'following':
        if (!currentUserId) {
          result = await baseQuery.orderBy(desc(cards.animatedAt)).limit(limit);
        } else {
          const followedUsers = await db
            .select({ followingUserId: follows.followingUserId })
            .from(follows)
            .where(eq(follows.followerUserId, currentUserId));

          const followedUserIds = followedUsers.map(f => f.followingUserId);

          if (followedUserIds.length === 0) {
            result = [];
          } else {
            result = await db
              .select({
                // Card fields
                id: cards.id,
                name: cards.name,
                description: cards.description,
                type: cards.type,
                subtype: cards.subtype,
                supertype: cards.supertype,
                rarity: cards.rarity,
                hitpoints: cards.hitpoints,
                cardNumber: cards.cardNumber,
                totalInSet: cards.totalInSet,
                illustrator: cards.illustrator,
                dexStats: cards.dexStats,
                moves: cards.moves,
                ability: cards.ability,
                weakness: cards.weakness,
                resistance: cards.resistance,
                retreatCost: cards.retreatCost,
                imageData: cards.imageData,
                cardEditorState: cards.cardEditorState,
                animationUrl: cards.animationUrl,
                animationKey: cards.animationKey,
                animationPrompt: cards.animationPrompt,
                animatedAt: cards.animatedAt,
                createdAt: cards.createdAt,
                isPublic: cards.isPublic,
                userId: cards.userId,
                username: users.displayName,
                userAvatar: users.avatarUrl,
              })
              .from(cards)
              .leftJoin(users, eq(cards.userId, users.userId))
              .where(
                and(
                  eq(cards.isPublic, true),
                  isNotNull(cards.animatedAt),
                  inArray(cards.userId, followedUserIds),
                  cursor
                    ? sql`${cards.animatedAt} < ${new Date(cursor)}`
                    : undefined,
                ),
              )
              .orderBy(desc(cards.animatedAt))
              .limit(limit);
          }
        }
        break;

      default: // 'ranked' - enhanced intelligent ranking
        // Get more for advanced ranking
        result = await baseQuery
          .orderBy(desc(cards.animatedAt))
          .limit(limit * 4);
        break;
    }

    if (result.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        nextCursor: null,
        hasMore: false,
      });
    }

    // Enhanced engagement data retrieval with performance optimization
    const cardIds = result.map((card: any) => card.id);

    // If no cards found, return early
    if (cardIds.length === 0) {
      return NextResponse.json({
        data: [],
        total: 0,
        nextCursor: null,
        hasMore: false,
        sortBy,
        metadata: {
          algorithm: 'enhanced-v2',
          features: [
            'engagement-velocity',
            'content-freshness',
            'creator-authority',
            'content-diversity',
          ],
          personalization: !!currentUserId,
          cacheStrategy: sortBy === 'latest' ? 'short' : 'medium',
        },
      });
    }

    // Parallel data fetching for better performance
    const [likesData, userLikes, userFollows, creatorStats] = await Promise.all(
      [
        // Get likes count for these cards
        cardIds.length > 0
          ? db
            .select({
              cardId: cardLikes.cardId,
              count: sql<number>`COALESCE(${count(cardLikes.id)}, 0)`,
            })
            .from(cardLikes)
            .where(inArray(cardLikes.cardId, cardIds))
            .groupBy(cardLikes.cardId)
          : [],

        // Get user's likes if logged in
        currentUserId && cardIds.length > 0
          ? db
            .select({ cardId: cardLikes.cardId })
            .from(cardLikes)
            .where(
              and(
                eq(cardLikes.userId, currentUserId),
                inArray(cardLikes.cardId, cardIds),
              ),
            )
          : [],

        // Get user's follows if logged in
        currentUserId && result.length > 0
          ? db
            .select({ followingUserId: follows.followingUserId })
            .from(follows)
            .where(
              and(
                eq(follows.followerUserId, currentUserId),
                inArray(
                  follows.followingUserId,
                  result.map((card: any) => card.userId).filter(Boolean),
                ),
              ),
            )
          : [],

        // Get creator statistics for authority scoring
        result.length > 0
          ? db
            .select({
              userId: cards.userId,
              totalLikes: sql<number>`COALESCE(${sum(cardLikes.id)}, 0)`,
              totalCards: count(cards.id),
              avgLikes: sql<number>`COALESCE(${avg(
                sql<number>`COALESCE(${cardLikes.id}, 0)`,
              )}, 0)`,
            })
            .from(cards)
            .leftJoin(cardLikes, eq(cards.id, cardLikes.cardId))
            .where(
              and(
                inArray(
                  cards.userId,
                  result.map((card: any) => card.userId).filter(Boolean),
                ),
                eq(cards.isPublic, true),
              ),
            )
            .groupBy(cards.userId)
          : [],
      ],
    );

    // Create lookup maps
    const likesMap = new Map(likesData.map(item => [item.cardId, item.count]));
    const userLikesSet = new Set(userLikes.map(item => item.cardId));
    const userFollowsSet = new Set(
      userFollows.map(item => item.followingUserId),
    );
    const creatorStatsMap = new Map(
      creatorStats.map(item => [item.userId, item]),
    );

    // Get user behavior patterns for personalization
    const userLikedTypes = new Set<string>();
    if (currentUserId) {
      const userLikesData = await db
        .select({
          cardType: cards.type,
        })
        .from(cardLikes)
        .innerJoin(cards, eq(cardLikes.cardId, cards.id))
        .where(eq(cardLikes.userId, currentUserId))
        .limit(100);

      userLikesData.forEach(item => userLikedTypes.add(item.cardType));
    }

    // Calculate ranking scores and transform data
    const transformedCards: FeedCard[] = result.map((card: any) => {
      const likesCount = likesMap.get(card.id) || 0;
      const isLiked = userLikesSet.has(card.id);
      const isFollowedUser = card.userId
        ? userFollowsSet.has(card.userId)
        : false;

      // Advanced metrics calculation
      const hoursSinceCreation =
        (Date.now() - new Date(card.animatedAt).getTime()) / (1000 * 60 * 60);
      const engagementVelocity = calculateEngagementVelocity(
        likesCount,
        hoursSinceCreation,
      );
      const contentFreshness = calculateContentFreshness(hoursSinceCreation);

      // Creator authority calculation
      const creatorStat = creatorStatsMap.get(card.userId);
      const creatorAuthority = creatorStat
        ? calculateCreatorAuthority(
          Number(creatorStat.totalLikes) || 0,
          Number(creatorStat.totalCards) || 0,
          Number(creatorStat.avgLikes) || 0,
          engagementVelocity,
        )
        : 0;

      // Content diversity score
      const contentDiversity = calculateContentDiversity(
        userLikedTypes,
        card.type,
        userFollowsSet,
        card.userId,
      );

      // Calculate ranking score based on multiple factors
      let rankingScore = 0;

      if (sortBy === 'ranked') {
        // Enhanced time decay
        const timeDecay = calculateTimeDecay(hoursSinceCreation);

        // Engagement factors
        const engagementScore = Math.log10(likesCount + 1) * 15;
        const velocityBonus = engagementVelocity * 5;

        // Content quality signals
        const hasAnimation = card.animationUrl ? 25 : 0;
        const hasPrompt = card.animationPrompt ? 15 : 0;
        const rarityBonus =
          card.rarity === 'Legendary'
            ? 20
            : card.rarity === 'Rare'
              ? 15
              : card.rarity === 'Uncommon'
                ? 10
                : 0;

        // Social signals
        const followBonus = isFollowedUser ? 60 : 0;
        const authorityBonus = creatorAuthority * 0.5;
        const diversityBonus = contentDiversity;

        // Freshness and velocity
        const freshnessBonus = contentFreshness * 10;

        // Combine all factors with weights
        rankingScore =
          (engagementScore * 0.25 +
            velocityBonus * 0.2 +
            followBonus * 0.15 +
            authorityBonus * 0.1 +
            hasAnimation * 0.1 +
            rarityBonus * 0.08 +
            diversityBonus * 0.07 +
            freshnessBonus * 0.05) *
          timeDecay;
      }

      return {
        ...card,
        user: {
          name: card.username || 'Anonymous',
          image: card.userAvatar || null,
        },
        likesCount,
        isLiked,
        isFollowedUser,
        engagementVelocity,
        contentFreshness,
        creatorAuthority,
        rankingScore,
      };
    });

    // Apply final sorting based on sort parameter
    let finalCards = transformedCards;
    switch (sortBy) {
      case 'trending':
        // Sort by engagement velocity for trending
        finalCards = transformedCards
          .sort((a, b) => b.engagementVelocity - a.engagementVelocity)
          .slice(0, limit);
        break;

      case 'ranked':
        // Sort by ranking score
        finalCards = transformedCards
          .sort((a, b) => b.rankingScore - a.rankingScore)
          .slice(0, limit);
        break;

      default:
        // latest and following are already sorted by animatedAt
        finalCards = transformedCards.slice(0, limit);
        break;
    }

    // Get cursor for next page
    const nextCursor =
      finalCards.length > 0
        ? finalCards[finalCards.length - 1].animatedAt
        : null;

    // Enhanced response with metadata
    return NextResponse.json({
      data: finalCards,
      total: finalCards.length,
      nextCursor,
      hasMore: finalCards.length === limit,
      sortBy,
      metadata: {
        algorithm: 'enhanced-v2',
        features: [
          'engagement-velocity',
          'content-freshness',
          'creator-authority',
          'content-diversity',
        ],
        personalization: !!currentUserId,
        cacheStrategy: sortBy === 'latest' ? 'short' : 'medium',
      },
    });
  } catch (error) {
    console.error('Error fetching animated cards feed:', error);
    return NextResponse.json(
      { error: 'Failed to fetch animated cards' },
      { status: 500 },
    );
  }
}

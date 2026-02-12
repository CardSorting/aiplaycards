import { db } from '../../../../src/db';
import {
  cardComments,
  cardLikes,
  cardRatings,
  cards,
  users,
} from '../../../../src/db/schema';
import { and, count, desc, eq, like, or, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const rarity = searchParams.get('rarity') || '';
    const type = searchParams.get('type') || '';
    const sort = searchParams.get('sort') || 'recent';

    // Calculate offset
    const offset = (page - 1) * limit;

    // Build where conditions
    let whereClause = and(
      eq(cards.pregenerated, true),
      eq(cards.packSlug, 'community'),
      eq(cards.isPublic, true),
    );

    if (search) {
      whereClause = and(
        whereClause,
        or(
          like(cards.name, `%${search}%`),
          like(cards.description, `%${search}%`),
        ),
      );
    }

    if (rarity) {
      whereClause = and(whereClause, eq(cards.rarity, rarity));
    }

    if (type) {
      whereClause = and(whereClause, eq(cards.type, type));
    }

    // Create subquery for likes count
    const likesCountSubquery = db
      .select({
        cardId: cardLikes.cardId,
        count: count(cardLikes.id).as('likes_count'),
      })
      .from(cardLikes)
      .groupBy(cardLikes.cardId)
      .as('likes_count_subquery');

    // Create subquery for ratings
    const ratingsSubquery = db
      .select({
        cardId: cardRatings.cardId,
        avgRating: sql<number>`AVG(${cardRatings.rating})`,
        ratingCount: count(cardRatings.id),
      })
      .from(cardRatings)
      .groupBy(cardRatings.cardId)
      .as('ratings_subquery');

    // Create subquery for comments count
    const commentsSubquery = db
      .select({
        cardId: cardComments.cardId,
        commentCount: count(cardComments.id),
      })
      .from(cardComments)
      .groupBy(cardComments.cardId)
      .as('comments_subquery');

    // Determine order by based on sort parameter
    let orderBy;
    switch (sort) {
      case 'popular':
        orderBy = desc(sql<number>`COALESCE(${likesCountSubquery.count}, 0)`);
        break;
      case 'top-rated':
        orderBy = desc(sql<number>`COALESCE(${ratingsSubquery.avgRating}, 0)`);
        break;
      case 'recent':
      default:
        orderBy = desc(cards.createdAt);
        break;
    }

    // Fetch community cards with creator info and likes
    const communityCards = await db
      .select({
        id: cards.id,
        name: cards.name,
        description: cards.description,
        type: cards.type,
        subtype: cards.subtype,
        supertype: cards.supertype,
        rarity: cards.rarity,
        hitpoints: cards.hitpoints,
        illustrator: cards.illustrator,
        dexStats: cards.dexStats,
        moves: cards.moves,
        ability: cards.ability,
        weakness: cards.weakness,
        resistance: cards.resistance,
        retreatCost: cards.retreatCost,
        imageData: cards.imageData,
        createdAt: cards.createdAt,
        updatedAt: cards.updatedAt,
        // Creator info
        creatorUsername: users.username,
        creatorUserId: users.userId,
        // Likes info
        likesCount: sql<number>`COALESCE(${likesCountSubquery.count}, 0)`,
        // Ratings info
        rating: sql<number>`COALESCE(${ratingsSubquery.avgRating}, 0)`,
        ratingCount: sql<number>`COALESCE(${ratingsSubquery.ratingCount}, 0)`,
        // Comments count
        commentCount: sql<number>`COALESCE(${commentsSubquery.commentCount}, 0)`,
      })
      .from(cards)
      .leftJoin(users, eq(cards.userId, users.userId))
      .leftJoin(likesCountSubquery, eq(cards.id, likesCountSubquery.cardId))
      .leftJoin(ratingsSubquery, eq(cards.id, ratingsSubquery.cardId))
      .leftJoin(commentsSubquery, eq(cards.id, commentsSubquery.cardId))
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Return the cards with likes info
    // Note: isLiked status will be fetched separately by the frontend
    const cardsWithLikes = communityCards;

    // Get total count for pagination
    const totalCountResult = await db
      .select({ count: count() })
      .from(cards)
      .where(whereClause);

    const totalCount = totalCountResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      cards: cardsWithLikes,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: 'Internal server error',
      },
      { status: 500 },
    );
  }
}

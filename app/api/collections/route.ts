import { NextRequest, NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { db } from '../../../src/db';
import { collections } from '../../../src/db/schema';
import { auth } from '../../../auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // Filter by collection type
    const tag = searchParams.get('tag'); // Filter by specific tag
    const category = searchParams.get('category'); // Filter by specific category
    const search = searchParams.get('search'); // Text search in name/description

    // Start with base condition
    let whereConditions = eq(collections.userId, session.user.id);

    // Add type filter
    if (type) {
      whereConditions = and(whereConditions, eq(collections.type, type));
    }

    // Add tag filter (JSONB array contains)
    if (tag) {
      whereConditions = and(
        whereConditions,
        sql`${collections.tags} @> ${JSON.stringify([tag])}`,
      );
    }

    // Add category filter (JSONB array contains)
    if (category) {
      whereConditions = and(
        whereConditions,
        sql`${collections.categories} @> ${JSON.stringify([category])}`,
      );
    }

    // Add text search filter
    if (search) {
      const searchLower = search.toLowerCase();
      whereConditions = and(
        whereConditions,
        sql`lower(${
          collections.name
        }) LIKE ${`%${searchLower}%`} OR lower(coalesce(${
          collections.description
        }, '')) LIKE ${`%${searchLower}%`}`,
      );
    }

    const userCollections = await db
      .select()
      .from(collections)
      .where(whereConditions)
      .orderBy(collections.updatedAt);

    // Get available tags and categories for filter options
    const allCollections = await db
      .select({
        tags: collections.tags,
        categories: collections.categories,
      })
      .from(collections)
      .where(eq(collections.userId, session.user.id));

    const availableTags = new Set<string>();
    const availableCategories = new Set<string>();

    allCollections.forEach(collection => {
      if (collection.tags && Array.isArray(collection.tags)) {
        collection.tags.forEach((tag: string) => availableTags.add(tag));
      }
      if (collection.categories && Array.isArray(collection.categories)) {
        collection.categories.forEach((cat: string) =>
          availableCategories.add(cat),
        );
      }
    });

    return NextResponse.json({
      success: true,
      collections: userCollections,
      filters: {
        availableTags: Array.from(availableTags).sort(),
        availableCategories: Array.from(availableCategories).sort(),
      },
    });
  } catch (error) {
    console.error('Collections fetch error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch collections',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      type = 'user_created',
      tags,
      isPrivate = true,
    } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 },
      );
    }

    const newCollection = await db
      .insert(collections)
      .values({
        name: name.trim(),
        description: description?.trim(),
        type,
        userId: session.user.id,
        tags,
        isPrivate,
      })
      .returning();

    return NextResponse.json({
      success: true,
      collection: newCollection[0],
    });
  } catch (error) {
    console.error('Collection creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create collection',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '../../../src/db';
import { mtgCards } from '../../../src/db/schema/mtg-cards';
import { desc, eq } from 'drizzle-orm';

import {
  defaultSpamConfig,
  withSpamPrevention,
} from '../../../src/middleware/spam-prevention-new';

// Custom spam configuration for MTG card creation
const mtgCardSpamConfig = {
  ...defaultSpamConfig,
  maxRequestsPerMinute: 5, // 5 cards per minute
  maxRequestsPerHour: 30, // 30 cards per hour
  maxRequestsPerDay: 200, // 200 cards per day
  minContentLength: 5, // Minimum name length
  maxContentLength: 5000, // Maximum total content length
  // Enable intelligent features
  enableAdaptiveThresholds: true,
  enableUserReputation: true,
  enableContentQualityScoring: true,
  enableBehavioralAnalysis: true,
  enableAnomalyDetection: true,
  // Profanity detection
  enableProfanityFilter: true,
  profanityAction: 'block' as const,
  profanityThreshold: 0,
};

/**
 * Validate MTG card content for spam prevention
 */
function validateMTGCardContent(cardData: any): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate card name
  if (!cardData.name || cardData.name.trim().length < 2) {
    errors.push('Card name must be at least 2 characters long');
  }
  if (cardData.name && cardData.name.length > 100) {
    errors.push('Card name must be 100 characters or less');
  }

  // Validate card type
  if (!cardData.type || cardData.type.trim().length < 3) {
    errors.push('Card type is required and must be at least 3 characters');
  }

  // Validate text content if provided
  if (cardData.text) {
    if (cardData.text.length > 1000) {
      errors.push('Card text must be 1000 characters or less');
    }

    // Check for repetitive content
    const words = cardData.text.trim().split(/\s+/);
    const uniqueWords = new Set(words.map((w: string) => w.toLowerCase()));
    const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 1;

    if (words.length > 10 && uniqueRatio < 0.3) {
      errors.push('Card text appears to contain repetitive content');
    }
  }

  // Validate power/toughness if provided
  if (cardData.power !== undefined && cardData.power !== null) {
    const power = cardData.power.toString();
    if (power.length > 10) {
      errors.push('Power value is too long');
    }
  }

  if (cardData.toughness !== undefined && cardData.toughness !== null) {
    const toughness = cardData.toughness.toString();
    if (toughness.length > 10) {
      errors.push('Toughness value is too long');
    }
  }

  // Validate mana cost if provided
  if (cardData.manaCost && cardData.manaCost.length > 50) {
    errors.push('Mana cost must be 50 characters or less');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Sanitize MTG card data
 */
function sanitizeMTGCardData(cardData: any): any {
  const sanitized = {
    name: cardData.name?.toString().trim().slice(0, 100) || '',
    manaCost: cardData.manaCost?.toString().trim().slice(0, 50) || '',
    convertedManaCost: cardData.convertedManaCost
      ? parseInt(cardData.convertedManaCost)
      : 0,
    type: cardData.type?.toString().trim().slice(0, 200) || '',
    subTypes: Array.isArray(cardData.subTypes)
      ? cardData.subTypes
          .slice(0, 10)
          .map((s: any) => s.toString().trim().slice(0, 50))
      : [],
    rarity: ['common', 'uncommon', 'rare', 'mythic'].includes(cardData.rarity)
      ? cardData.rarity
      : 'common',
    set: cardData.set?.toString().trim().slice(0, 10) || 'Custom',
    artist: cardData.artist?.toString().trim().slice(0, 100) || '',
    flavorText: cardData.flavorText?.toString().trim().slice(0, 500) || '',
    power: cardData.power?.toString().trim().slice(0, 10) || '',
    toughness: cardData.toughness?.toString().trim().slice(0, 10) || '',
    loyalty: cardData.loyalty?.toString().trim().slice(0, 10) || '',
    text: cardData.text?.toString().trim().slice(0, 1000) || '',
    layout: [
      'normal',
      'full_art',
      'split',
      'flip',
      'transform',
      'modal_dfc',
      'meld',
      'leveler',
      'saga',
      'adventure',
      'planeswalker',
      'battle',
    ].includes(cardData.layout)
      ? cardData.layout
      : 'normal',
    colors: Array.isArray(cardData.colors)
      ? cardData.colors
          .filter((c: any) => ['W', 'U', 'B', 'R', 'G'].includes(c))
          .slice(0, 5)
      : [],
    colorIdentity: Array.isArray(cardData.colorIdentity)
      ? cardData.colorIdentity
          .filter((c: any) => ['W', 'U', 'B', 'R', 'G'].includes(c))
          .slice(0, 5)
      : [],
    isToken: Boolean(cardData.isToken),
  };

  return sanitized;
}

// MTG card creation handler wrapped with intelligent spam prevention
async function handleMTGCardCreation(
  request: NextRequest,
  user: any,
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { cardData, renderedImageUrl } = body;

    if (!cardData) {
      return NextResponse.json(
        { error: 'Card data is required' },
        { status: 400 },
      );
    }

    // Enhanced content validation
    const contentValidation = validateMTGCardContent(cardData);
    if (!contentValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Content validation failed',
          details: contentValidation.errors,
        },
        { status: 400 },
      );
    }

    // Sanitize card data
    const sanitizedCardData = sanitizeMTGCardData(cardData);

    // Use the provided image URL (already uploaded to Backblaze) or fall back to generated image
    const imageUrl: string | null = renderedImageUrl || null;

    // Save to database
    const [savedCard] = await db
      .insert(mtgCards)
      .values({
        name: sanitizedCardData.name,
        manaCost: sanitizedCardData.manaCost || null,
        convertedManaCost: sanitizedCardData.convertedManaCost || null,
        type: sanitizedCardData.type,
        subTypes:
          sanitizedCardData.subTypes.length > 0
            ? sanitizedCardData.subTypes
            : null,
        rarity: sanitizedCardData.rarity,
        set: sanitizedCardData.set,
        artist: sanitizedCardData.artist || null,
        flavorText: sanitizedCardData.flavorText || null,
        power: sanitizedCardData.power || null,
        toughness: sanitizedCardData.toughness || null,
        loyalty: sanitizedCardData.loyalty || null,
        text: sanitizedCardData.text || null,
        imageUrl: imageUrl,
        layout: sanitizedCardData.layout,
        colors:
          sanitizedCardData.colors.length > 0 ? sanitizedCardData.colors : null,
        colorIdentity:
          sanitizedCardData.colorIdentity.length > 0
            ? sanitizedCardData.colorIdentity
            : null,
        isToken: sanitizedCardData.isToken,
        isPublic: true, // Default to public
        userId: user.id,
        source: 'editor',
        cardEditorState: cardData, // Store original data for potential future editing
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: 'MTG card created successfully',
        card: savedCard,
        imageUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating MTG card:', error);

    // Handle database constraint errors
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'A card with similar properties already exists' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to create MTG card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  // Apply intelligent spam prevention to the handler
  const protectedHandler = await withSpamPrevention(
    handleMTGCardCreation,
    mtgCardSpamConfig,
  );
  return await protectedHandler(request);
}

export async function GET() {
  try {
    // Get recent public MTG cards
    const cards = await db
      .select()
      .from(mtgCards)
      .where(eq(mtgCards.isPublic, true))
      .orderBy(desc(mtgCards.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      cards,
    });
  } catch (error) {
    console.error('Error fetching MTG cards:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch MTG cards',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

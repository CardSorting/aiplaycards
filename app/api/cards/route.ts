import { NextRequest, NextResponse } from 'next/server';
import { cardQueries } from '../../../src/db/queries';
import { dbUtils } from '../../../src/db/utils';
import { auth } from '../../../auth';
import type { CardFilters, CreateCardRequest } from '../../../src/db/types';
import { defaultSpamConfig } from '../../../src/middleware/spam-prevention-new';

// Custom spam configuration for card creation with intelligent features
const cardSpamConfig = {
  ...defaultSpamConfig,
  maxRequestsPerMinute: 5, // 5 cards per minute
  maxRequestsPerHour: 30, // 30 cards per hour
  maxRequestsPerDay: 200, // 200 cards per day
  minContentLength: 10, // Minimum description length
  maxContentLength: 1000, // Maximum description length
  // Enable all intelligent features
  enableAdaptiveThresholds: true,
  enableUserReputation: true,
  enableContentQualityScoring: true,
  enableBehavioralAnalysis: true,
  enableAnomalyDetection: true,
  // Profanity detection
  enableProfanityFilter: true,
  profanityAction: 'block' as const, // Block submissions with profanity
  profanityThreshold: 0, // Any profanity triggers action
};

function stringifyUnknownError(error: unknown): string {
  try {
    if (!error) return '';
    if (typeof error === 'string') return error;
    if (error instanceof Error) {
      const cause = (error as any).cause;
      const causeMsg = cause?.message || '';
      return [error.message, causeMsg].filter(Boolean).join(' | ');
    }
    return JSON.stringify(error);
  } catch {
    return '' + error;
  }
}

function isQuotaExceededError(error: unknown): boolean {
  const blob = stringifyUnknownError(error).toLowerCase();
  return (
    blob.includes('quota') ||
    blob.includes('limit') ||
    blob.includes('exceeded') ||
    blob.includes('insufficient')
  );
}

// Enhanced content validation function
function validateCardContent(cardData: CreateCardRequest): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Enhanced name validation
  if (cardData.name) {
    const name = cardData.name.trim();

    if (name.length < 2) {
      errors.push('Card name must be at least 2 characters long');
    }

    if (name.length > 50) {
      errors.push('Card name must be 50 characters or less');
    }

    // Check for repetitive characters (spam pattern)
    if (/(.)\1{4,}/.test(name)) {
      errors.push('Card name contains too many repeated characters');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^[a-z]+$/i, // All letters (too generic)
      /^[0-9]+$/, // All numbers
      /^(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc)+$/i, // Common spam words
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(name))) {
      errors.push('Card name appears to be a test or spam entry');
    }
  }

  // Enhanced description validation
  if (cardData.description) {
    const description = cardData.description.trim();

    if (description.length < 10) {
      errors.push('Description must be at least 10 characters long');
    }

    if (description.length > 1000) {
      errors.push('Description must be 1000 characters or less');
    }

    // Check for repetitive content (spam pattern)
    const words = description.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (words.length > 5 && uniqueWords.size < words.length * 0.3) {
      errors.push('Description appears to contain repetitive content');
    }

    // Check for suspicious patterns in description
    const suspiciousDescPatterns = [
      /(.)\1{5,}/, // 6+ repeated characters
      /(word|text|description|test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc){3,}/i, // Repeated spam words
    ];

    if (suspiciousDescPatterns.some(pattern => pattern.test(description))) {
      errors.push('Description contains suspicious patterns');
    }
  }

  // Validate moves if present
  if (cardData.moves) {
    if (Array.isArray(cardData.moves)) {
      cardData.moves.forEach((move, index) => {
        if (move.name && move.name.trim().length < 2) {
          errors.push(
            `Move ${index + 1} name must be at least 2 characters long`,
          );
        }
        if (move.description && move.description.trim().length < 10) {
          errors.push(
            `Move ${index + 1} description must be at least 10 characters long`,
          );
        }
      });
    } else if (typeof cardData.moves === 'object') {
      // Handle move1/move2 structure
      const move1 = (cardData.moves as any).move1;
      const move2 = (cardData.moves as any).move2;

      if (move1) {
        if (move1.name && move1.name.trim().length < 2) {
          errors.push('Move 1 name must be at least 2 characters long');
        }
        if (move1.description && move1.description.trim().length < 10) {
          errors.push('Move 1 description must be at least 10 characters long');
        }
      }

      if (move2) {
        if (move2.name && move2.name.trim().length < 2) {
          errors.push('Move 2 name must be at least 2 characters long');
        }
        if (move2.description && move2.description.trim().length < 10) {
          errors.push('Move 2 description must be at least 10 characters long');
        }
      }
    }
  }

  // Validate ability if present
  if (cardData.ability) {
    if (cardData.ability.name && cardData.ability.name.trim().length < 2) {
      errors.push('Ability name must be at least 2 characters long');
    }
    if (
      cardData.ability.description &&
      cardData.ability.description.trim().length < 10
    ) {
      errors.push('Ability description must be at least 10 characters long');
    }
  }

  // Validate numeric fields
  if (cardData.hitpoints !== undefined && cardData.hitpoints !== null) {
    const hp = Number(cardData.hitpoints);
    if (hp < 10 || hp > 999) {
      errors.push('Hit points must be between 10 and 999');
    }
  }

  if (cardData.retreatCost !== undefined && cardData.retreatCost !== null) {
    const retreat = Number(cardData.retreatCost);
    if (retreat < 0 || retreat > 5) {
      errors.push('Retreat cost must be between 0 and 5');
    }
  }

  // Validate dex stats
  if (cardData.dexStats) {
    if (typeof cardData.dexStats === 'object' && cardData.dexStats !== null) {
      const dexStats = cardData.dexStats as any;

      // Validate height
      if (dexStats.height && typeof dexStats.height === 'string') {
        if (dexStats.height.trim().length > 50) {
          errors.push('Dex stats height must be 50 characters or less');
        }
      }

      // Validate weight
      if (dexStats.weight && typeof dexStats.weight === 'string') {
        if (dexStats.weight.trim().length > 50) {
          errors.push('Dex stats weight must be 50 characters or less');
        }
      }

      // Validate category
      if (dexStats.category && typeof dexStats.category === 'string') {
        if (dexStats.category.trim().length > 100) {
          errors.push('Dex stats category must be 100 characters or less');
        }
      }
    } else if (typeof cardData.dexStats === 'string') {
      // Handle legacy string format
      const dexStatsString = cardData.dexStats as string;
      if (dexStatsString.trim().length > 200) {
        errors.push('Dex stats must be 200 characters or less');
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export async function GET(request: NextRequest) {
  try {
    // Validate database connection
    dbUtils.validateEnv();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const type = searchParams.get('type');
    const supertype = searchParams.get('supertype');
    const rarity = searchParams.get('rarity');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const search = searchParams.get('search');
    const isPublic = searchParams.get('isPublic');
    const source = searchParams.get('source');
    const view = searchParams.get('view') || 'full';

    const filters: CardFilters = {
      userId: userId || undefined,
      type: type || undefined,
      supertype: supertype || undefined,
      rarity: rarity || undefined,
      limit: limit ? parseInt(limit, 10) : 50,
      offset: offset ? parseInt(offset, 10) : 0,
      isPublic:
        isPublic === 'true' ? true : isPublic === 'false' ? false : undefined,
      source: source || undefined,
    };

    let cards;
    if (view === 'summary') {
      cards = await cardQueries.getAllSummary(filters);
    } else {
      cards = await cardQueries.getAll(filters);
    }

    const isUserScoped = Boolean(userId);
    const explicitlyPublic = isPublic === 'true';
    const explicitlyPrivate = isPublic === 'false';

    // Disable caching for user-specific requests to ensure fresh data after pack openings
    const cacheHeader =
      !isUserScoped && explicitlyPublic
        ? 'public, max-age=300, s-maxage=600, stale-while-revalidate=1200'
        : 'no-store';

    return NextResponse.json(
      {
        success: true,
        data: cards,
        count: cards.length,
      },
      {
        headers: {
          'Cache-Control': cacheHeader,
          Vary: 'Accept-Encoding',
        },
      },
    );
  } catch (error) {
    console.error('Error fetching cards:', error);
    if (isQuotaExceededError(error)) {
      return NextResponse.json(
        {
          success: false,
          data: [],
          count: 0,
          error: 'Service temporarily unavailable',
          message:
            'Database quota exceeded. Please try again in a bit. Upgrading is in progress.',
          code: 'NEON_QUOTA_EXCEEDED',
        },
        { status: 503, headers: { 'Cache-Control': 'no-store' } },
      );
    }
    return NextResponse.json(
      {
        success: false,
        data: [],
        count: 0,
        error: 'Failed to fetch cards',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}

// Card creation handler wrapped with intelligent spam prevention
async function handleCardCreation(
  request: NextRequest,
  user: any,
): Promise<NextResponse> {
  try {
    const cardData: CreateCardRequest = await request.json();

    // Basic validation
    if (!cardData.name || !cardData.type || !cardData.supertype) {
      return NextResponse.json(
        {
          error: 'Missing required fields',
          required: ['name', 'type', 'supertype'],
        },
        { status: 400 },
      );
    }

    // Enhanced content validation
    const contentValidation = validateCardContent(cardData);
    if (!contentValidation.isValid) {
      return NextResponse.json(
        {
          error: 'Content validation failed',
          details: contentValidation.errors,
        },
        { status: 400 },
      );
    }

    // Enhanced sanitization
    cardData.name = dbUtils.sanitizeString(cardData.name);
    if (cardData.description) {
      cardData.description = dbUtils.sanitizeString(cardData.description, 1000);
    }

    // Sanitize move names and descriptions
    if (cardData.moves) {
      if (Array.isArray(cardData.moves)) {
        cardData.moves.forEach(move => {
          if (move.name) move.name = dbUtils.sanitizeString(move.name, 30);
          if (move.description)
            move.description = dbUtils.sanitizeString(move.description, 200);
        });
      } else if (typeof cardData.moves === 'object') {
        const move1 = (cardData.moves as any).move1;
        const move2 = (cardData.moves as any).move2;

        if (move1) {
          if (move1.name) move1.name = dbUtils.sanitizeString(move1.name, 30);
          if (move1.description)
            move1.description = dbUtils.sanitizeString(move1.description, 200);
        }

        if (move2) {
          if (move2.name) move2.name = dbUtils.sanitizeString(move2.name, 30);
          if (move2.description)
            move2.description = dbUtils.sanitizeString(move2.description, 200);
        }
      }
    }

    // Sanitize ability
    if (cardData.ability) {
      if (cardData.ability.name)
        cardData.ability.name = dbUtils.sanitizeString(
          cardData.ability.name,
          30,
        );
      if (cardData.ability.description)
        cardData.ability.description = dbUtils.sanitizeString(
          cardData.ability.description,
          200,
        );
    }

    // Sanitize illustrator
    if (cardData.illustrator) {
      cardData.illustrator = dbUtils.sanitizeString(cardData.illustrator, 50);
    }

    // Sanitize dex stats
    if (cardData.dexStats) {
      // dexStats is a JSON object with height, weight, category properties
      // Validate and sanitize each property individually
      if (typeof cardData.dexStats === 'object' && cardData.dexStats !== null) {
        const dexStats = cardData.dexStats as any;

        if (dexStats.height && typeof dexStats.height === 'string') {
          dexStats.height = dbUtils.sanitizeString(dexStats.height, 50);
        }

        if (dexStats.weight && typeof dexStats.weight === 'string') {
          dexStats.weight = dbUtils.sanitizeString(dexStats.weight, 50);
        }

        if (dexStats.category && typeof dexStats.category === 'string') {
          dexStats.category = dbUtils.sanitizeString(dexStats.category, 100);
        }
      }
    }

    // Add user ID to card data
    cardData.userId = user.id;

    const newCard = await cardQueries.create(cardData as any);

    return NextResponse.json(
      {
        success: true,
        data: newCard,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating card:', error);
    return NextResponse.json(
      {
        error: 'Failed to create card',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    return await handleCardCreation(request, session.user);
  } catch (error) {
    console.error('POST /api/cards error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { YugiohCardService } from '../../../src/services/yugioh-card-service';
import { YugiohCardData } from '../../../src/features/yugiohEditor/types';
import {
  backblazeStorage,
  generateYugiohCardFileName,
  validateBackblazeConfig,
} from '../../../src/utils/backblaze';
import {
  defaultSpamConfig,
  withSpamPrevention,
} from '../../../src/middleware/spam-prevention-new';
import { dbUtils } from '../../../src/db/utils';

// Custom spam configuration for Yu-Gi-Oh card creation with intelligent features
const yugiohCardSpamConfig = {
  ...defaultSpamConfig,
  maxRequestsPerMinute: 5, // 5 cards per minute
  maxRequestsPerHour: 30, // 30 cards per hour
  maxRequestsPerDay: 200, // 200 cards per day
  minContentLength: 10, // Minimum description length
  maxContentLength: 2500, // Maximum description length (Yu-Gi-Oh cards can have longer effects)
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

/**
 * Validate Yu-Gi-Oh card content for spam prevention
 */
function validateYugiohCardContent(cardData: YugiohCardData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate card title
  if (!cardData.cardTitle || cardData.cardTitle.trim().length < 2) {
    errors.push('Card title must be at least 2 characters long');
  }
  if (cardData.cardTitle && cardData.cardTitle.length > 100) {
    errors.push('Card title must be 100 characters or less');
  }

  // Validate card type
  if (
    !cardData.cardType ||
    !['Monster', 'Spell', 'Trap'].includes(cardData.cardType)
  ) {
    errors.push('Valid card type is required (Monster, Spell, or Trap)');
  }

  // Validate card info/description
  if (cardData.cardInfo) {
    if (cardData.cardInfo.length < 10) {
      errors.push('Card description must be at least 10 characters long');
    }
    if (cardData.cardInfo.length > 2000) {
      errors.push('Card description must be 2000 characters or less');
    }

    // Check for repetitive content
    const words = cardData.cardInfo.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 1;

    if (words.length > 20 && uniqueRatio < 0.4) {
      errors.push('Card description appears to contain repetitive words');
    }
  }

  // Validate monster-specific fields
  if (cardData.cardType === 'Monster') {
    // Validate ATK/DEF values
    if (cardData.cardATK !== undefined && cardData.cardATK !== null) {
      const atk = parseInt(cardData.cardATK.toString());
      if (isNaN(atk) || atk < 0 || atk > 9999) {
        errors.push('ATK value must be between 0 and 9999');
      }
    }

    if (cardData.cardDEF !== undefined && cardData.cardDEF !== null) {
      const def = parseInt(cardData.cardDEF.toString());
      if (isNaN(def) || def < 0 || def > 9999) {
        errors.push('DEF value must be between 0 and 9999');
      }
    }

    // Validate level
    if (cardData.cardLevel !== undefined && cardData.cardLevel !== null) {
      const level = parseInt(cardData.cardLevel.toString());
      if (isNaN(level) || level < 1 || level > 12) {
        errors.push('Level must be between 1 and 12');
      }
    }

    // Validate pendulum properties
    if (cardData.Pendulum) {
      if (cardData.cardBLUE !== undefined && cardData.cardBLUE !== null) {
        const blue = parseInt(cardData.cardBLUE.toString());
        if (isNaN(blue) || blue < 1 || blue > 13) {
          errors.push('Pendulum scale (Blue) must be between 1 and 13');
        }
      }

      if (cardData.cardRED !== undefined && cardData.cardRED !== null) {
        const red = parseInt(cardData.cardRED.toString());
        if (isNaN(red) || red < 1 || red > 13) {
          errors.push('Pendulum scale (Red) must be between 1 and 13');
        }
      }
    }
  }

  // Check for spam patterns
  const spamKeywords = [
    'test',
    'spam',
    'fake',
    'dummy',
    'temp',
    'tmp',
    'asdf',
    'qwerty',
    '123',
    'abc',
  ];
  const contentToCheck = [
    cardData.cardTitle,
    cardData.cardInfo,
    cardData.cardCustomRace,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  const foundSpamKeywords = spamKeywords.filter(keyword =>
    contentToCheck.includes(keyword),
  );
  if (foundSpamKeywords.length >= 2) {
    errors.push(
      `Content contains spam keywords: ${foundSpamKeywords.join(', ')}`,
    );
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize Yu-Gi-Oh card data
 */
function sanitizeYugiohCardData(cardData: YugiohCardData): YugiohCardData {
  const sanitized = { ...cardData };

  // Sanitize card title
  if (sanitized.cardTitle) {
    sanitized.cardTitle = dbUtils.sanitizeString(sanitized.cardTitle, 100);
  }

  // Sanitize card info/description
  if (sanitized.cardInfo) {
    sanitized.cardInfo = dbUtils.sanitizeString(sanitized.cardInfo, 2000);
  }

  // Sanitize custom race
  if (sanitized.cardCustomRace) {
    sanitized.cardCustomRace = dbUtils.sanitizeString(
      sanitized.cardCustomRace,
      50,
    );
  }

  // Sanitize pendulum info
  if (sanitized.cardPendulumInfo) {
    sanitized.cardPendulumInfo = dbUtils.sanitizeString(
      sanitized.cardPendulumInfo,
      500,
    );
  }

  return sanitized;
}

// Yu-Gi-Oh card creation handler wrapped with intelligent spam prevention
async function handleYugiohCardCreation(
  request: NextRequest,
  user: any,
): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { cardData, imageDataUrl } = body;

    if (!cardData) {
      return NextResponse.json(
        { error: 'Card data is required' },
        { status: 400 },
      );
    }

    // Enhanced content validation
    const contentValidation = validateYugiohCardContent(cardData);
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
    const sanitizedCardData = sanitizeYugiohCardData(cardData);

    // Validate Backblaze configuration
    validateBackblazeConfig();

    let imageUrl: string | null = null;

    // Upload image to Backblaze if provided
    if (imageDataUrl) {
      try {
        const fileName = generateYugiohCardFileName(
          user.id,
          sanitizedCardData.cardTitle || 'untitled',
        );
        imageUrl = await backblazeStorage.uploadBase64Image(
          imageDataUrl,
          fileName,
        );
      } catch (error) {
        console.error('Failed to upload card image to Backblaze:', error);
        throw new Error('Failed to upload card image');
      }
    }

    const savedCard = await YugiohCardService.saveCard(
      user.id,
      sanitizedCardData as YugiohCardData,
      imageDataUrl,
    );

    return NextResponse.json({
      success: true,
      card: savedCard,
    });
  } catch (error) {
    console.error('Error saving Yu-Gi-Oh card:', error);
    return NextResponse.json({ error: 'Failed to save card' }, { status: 500 });
  }
}

// Export the POST endpoint wrapped with intelligent spam prevention
export async function POST(request: NextRequest) {
  const handler = await withSpamPrevention(
    handleYugiohCardCreation,
    yugiohCardSpamConfig,
    {
      requireAuth: true,
      validateContent: true,
      contentField: 'cardInfo',
    },
  );

  return handler(request);
}

// GET - Get user's Yu-Gi-Oh cards
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // For now, just get all user cards (pagination can be added to service later)
    const cards = await YugiohCardService.getUserCards(session.user.id);

    // Simple client-side pagination
    const paginatedCards = cards.slice(offset, offset + limit);

    return NextResponse.json({
      cards: paginatedCards,
      pagination: {
        page,
        limit,
        total: cards.length,
        totalPages: Math.ceil(cards.length / limit),
      },
    });
  } catch (error) {
    console.error('Error getting Yu-Gi-Oh cards:', error);
    return NextResponse.json({ error: 'Failed to get cards' }, { status: 500 });
  }
}

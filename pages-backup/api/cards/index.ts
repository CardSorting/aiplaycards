import type { NextApiRequest, NextApiResponse } from 'next';
import { cardQueries } from '../../../src/db/queries';
import { dbUtils } from '../../../src/db/utils';
import type { CardFilters, CreateCardRequest } from '../../../src/db/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    // Validate database connection
    dbUtils.validateEnv();

    switch (req.method) {
      case 'GET':
        return await handleGet(req, res);
      case 'POST':
        return await handlePost(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    isPublic,
    userId,
    type,
    supertype,
    rarity,
    limit = '50',
    offset = '0',
    search,
  } = req.query;

  try {
    let cards;

    // Handle search
    if (search && typeof search === 'string') {
      cards = await cardQueries.searchByName(search, isPublic !== 'false');
    } else {
      // Handle filters
      const filters: CardFilters = {
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10),
      };

      if (isPublic !== undefined) {
        filters.isPublic = isPublic === 'true';
      }

      if (userId && typeof userId === 'string') {
        filters.userId = userId;
      }

      cards = await cardQueries.getAll(filters);
    }

    return res.status(200).json({
      success: true,
      data: cards,
      count: cards.length,
    });
  } catch (error) {
    console.error('Error fetching cards:', error);
    return res.status(500).json({
      error: 'Failed to fetch cards',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const cardData: CreateCardRequest = req.body;

    // Basic validation
    if (!cardData.name || !cardData.type || !cardData.supertype) {
      return res.status(400).json({
        error: 'Missing required fields',
        required: ['name', 'type', 'supertype'],
      });
    }

    // Sanitize string inputs
    cardData.name = dbUtils.sanitizeString(cardData.name);
    if (cardData.description) {
      cardData.description = dbUtils.sanitizeString(cardData.description, 1000);
    }

    const newCard = await cardQueries.create(cardData);

    return res.status(201).json({
      success: true,
      data: newCard,
    });
  } catch (error) {
    console.error('Error creating card:', error);
    return res.status(500).json({
      error: 'Failed to create card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

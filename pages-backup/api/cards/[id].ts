import type { NextApiRequest, NextApiResponse } from 'next';
import { cardQueries } from '../../../src/db/queries';
import { dbUtils } from '../../../src/db/utils';
import type { UpdateCardRequest } from '../../../src/db/types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { id } = req.query;

  if (!id || Array.isArray(id)) {
    return res.status(400).json({ error: 'Invalid card ID' });
  }

  const cardId = parseInt(id, 10);
  if (isNaN(cardId)) {
    return res.status(400).json({ error: 'Card ID must be a number' });
  }

  try {
    // Validate database connection
    dbUtils.validateEnv();

    switch (req.method) {
      case 'GET':
        return await handleGet(cardId, res);
      case 'PUT':
        return await handlePut(cardId, req, res);
      case 'DELETE':
        return await handleDelete(cardId, res);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
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

async function handleGet(cardId: number, res: NextApiResponse) {
  try {
    const card = await cardQueries.getById(cardId);

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    return res.status(200).json({
      success: true,
      data: card,
    });
  } catch (error) {
    console.error('Error fetching card:', error);
    return res.status(500).json({
      error: 'Failed to fetch card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handlePut(
  cardId: number,
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const updateData: Partial<UpdateCardRequest> = req.body;

    // Remove id from update data if present
    delete updateData.id;

    // Sanitize string inputs
    if (updateData.name) {
      updateData.name = dbUtils.sanitizeString(updateData.name);
    }
    if (updateData.description) {
      updateData.description = dbUtils.sanitizeString(
        updateData.description,
        1000,
      );
    }

    const updatedCard = await cardQueries.update(cardId, updateData);

    if (!updatedCard) {
      return res.status(404).json({ error: 'Card not found' });
    }

    return res.status(200).json({
      success: true,
      data: updatedCard,
    });
  } catch (error) {
    console.error('Error updating card:', error);
    return res.status(500).json({
      error: 'Failed to update card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function handleDelete(cardId: number, res: NextApiResponse) {
  try {
    const deleted = await cardQueries.delete(cardId);

    if (!deleted) {
      return res.status(404).json({ error: 'Card not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting card:', error);
    return res.status(500).json({
      error: 'Failed to delete card',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '../index';
import { cards } from '../schema';
import type { Card, NewCard } from '../schema';
import type { CardFilters } from '../types';

export const cardQueries = {
  /**
   * Get all cards with filtering
   */
  getAll: async (filters: Partial<CardFilters> = {}) => {
    try {
      const whereConditions = [];

      if (filters.type) {
        whereConditions.push(eq(cards.type, filters.type));
      }

      if (filters.isPublic !== undefined) {
        whereConditions.push(eq(cards.isPublic, filters.isPublic));
      }

      if (filters.userId) {
        whereConditions.push(eq(cards.userId, filters.userId));
      }

      const query =
        whereConditions.length > 0
          ? db
              .select()
              .from(cards)
              .where(and(...whereConditions))
          : db.select().from(cards);

      return await query.limit(50); // Default limit
    } catch (error) {
      console.error('[cardQueries.getAll] Error:', error);
      return [];
    }
  },

  /**
   * Get card by ID
   */
  getById: async (id: number): Promise<Card | null> => {
    try {
      const result = await db
        .select()
        .from(cards)
        .where(eq(cards.id, id))
        .limit(1);
      return result[0] || null;
    } catch (error) {
      console.error('[cardQueries.getById] Error:', error);
      throw new Error('Failed to get card');
    }
  },

  /**
   * Search cards by name
   */
  searchByName: async (query: string, isPublic = true) => {
    try {
      return await db
        .select()
        .from(cards)
        .where(
          and(ilike(cards.name, `%${query}%`), eq(cards.isPublic, isPublic)),
        )
        .limit(20);
    } catch (error) {
      console.error('[cardQueries.searchByName] Error:', error);
      return [];
    }
  },

  /**
   * Get cards summary (count only)
   */
  getAllSummary: async (filters: Partial<CardFilters> = {}) => {
    try {
      const query = db
        .select({
          count: sql<number>`count(*)`.as('count'),
          type: cards.type,
        })
        .from(cards);

      if (filters.type) {
        query.where(eq(cards.type, filters.type));
      }

      return await query.groupBy(cards.type);
    } catch (error) {
      console.error('[cardQueries.getAllSummary] Error:', error);
      return [];
    }
  },

  /**
   * Create a new card
   */
  create: async (cardData: NewCard): Promise<Card> => {
    try {
      const [result] = await db.insert(cards).values(cardData).returning();
      return result;
    } catch (error) {
      console.error('[cardQueries.create] Error:', error);
      throw new Error('Failed to create card');
    }
  },

  /**
   * Update a card
   */
  update: async (
    id: number,
    updates: Partial<NewCard>,
  ): Promise<Card | null> => {
    try {
      const [result] = await db
        .update(cards)
        .set({
          ...updates,
          updatedAt: new Date(),
        })
        .where(eq(cards.id, id))
        .returning();

      return result || null;
    } catch (error) {
      console.error('[cardQueries.update] Error:', error);
      throw new Error('Failed to update card');
    }
  },

  /**
   * Delete a card
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      const result = await db.delete(cards).where(eq(cards.id, id));
      return (result.rowCount ?? 0) > 0;
    } catch (error) {
      console.error('[cardQueries.delete] Error:', error);
      return false;
    }
  },
};

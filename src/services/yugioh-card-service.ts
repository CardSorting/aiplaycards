import { db } from '../db';
import {
  type NewYugiohCard,
  type YugiohCard,
  yugiohCards,
} from '../db/schema/yugioh-cards';
import { and, desc, eq } from 'drizzle-orm';
import { YugiohCardData } from '../features/yugiohEditor/types';
import {
  backblazeStorage,
  generateYugiohCardFileName,
  validateBackblazeConfig,
} from '../utils/backblaze';

export class YugiohCardService {
  /**
   * Save a Yu-Gi-Oh card for the authenticated user
   */
  static async saveCard(
    userId: string,
    cardData: YugiohCardData,
    imageDataUrl?: string,
  ): Promise<YugiohCard> {
    // Validate Backblaze configuration
    validateBackblazeConfig();

    let imageUrl: string | null = null;

    // Upload image to Backblaze if provided
    if (imageDataUrl) {
      try {
        const fileName = generateYugiohCardFileName(
          userId,
          cardData.cardTitle || 'untitled',
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
    const cardToSave: NewYugiohCard = {
      // Basic info
      name: cardData.cardTitle || 'Untitled Card',
      description: cardData.cardInfo || null,

      // Card type
      cardType: cardData.cardType,
      cardSubtype: cardData.cardSubtype,
      cardRare: cardData.cardRare,

      // Monster-specific
      cardAttr: cardData.cardType === 'Monster' ? cardData.cardAttr : null,
      cardRace:
        cardData.cardType === 'Monster' && !cardData.cardCustomRaceEnabled
          ? cardData.cardRace
          : null,
      cardCustomRace:
        cardData.cardType === 'Monster' && cardData.cardCustomRaceEnabled
          ? cardData.cardCustomRace
          : null,
      cardCustomRaceEnabled:
        cardData.cardType === 'Monster'
          ? cardData.cardCustomRaceEnabled
          : false,
      cardLevel: cardData.cardType === 'Monster' ? cardData.cardLevel : null,
      cardATK: cardData.cardType === 'Monster' ? cardData.cardATK : null,
      cardDEF: cardData.cardType === 'Monster' ? cardData.cardDEF : null,

      // Effect types
      cardEff1: cardData.cardType === 'Monster' ? cardData.cardEff1 : null,
      cardEff2: cardData.cardType === 'Monster' ? cardData.cardEff2 : null,

      // Pendulum
      isPendulum: cardData.cardType === 'Monster' ? cardData.Pendulum : false,
      cardBLUE: cardData.Pendulum ? cardData.cardBLUE : null,
      cardRED: cardData.Pendulum ? cardData.cardRED : null,
      pendulumSize: cardData.Pendulum ? cardData.pendulumSize : null,
      cardPendulumInfo: cardData.Pendulum ? cardData.cardPendulumInfo : null,

      // Link monster
      links:
        cardData.cardType === 'Monster' && cardData.cardSubtype === 'Link'
          ? cardData.links
          : null,

      // Visual
      holo: cardData.holo,
      titleColor: cardData.titleColor,

      // Language
      uiLang: cardData.uiLang,
      cardLang: cardData.cardLang,

      // Text sizing
      infoSize: cardData.infoSize,

      // YGOPro
      cardKey: cardData.cardKey || null,
      cardLoadYgoProEnabled: cardData.cardLoadYgoProEnabled,

      // Image and editor state
      imageUrl: imageUrl,
      imageData: imageUrl ? { url: imageUrl } : null, // Keep for compatibility
      cardEditorState: cardData,

      // Ownership
      userId,
      isPublic: false, // Default to private
    };

    const [savedCard] = await db
      .insert(yugiohCards)
      .values(cardToSave)
      .returning();

    return savedCard;
  }

  /**
   * Get all cards for a user
   */
  static async getUserCards(userId: string): Promise<YugiohCard[]> {
    return await db
      .select()
      .from(yugiohCards)
      .where(eq(yugiohCards.userId, userId))
      .orderBy(desc(yugiohCards.createdAt));
  }

  /**
   * Get a specific card by ID and verify ownership
   */
  static async getCardById(
    id: number,
    userId?: string,
  ): Promise<YugiohCard | null> {
    const whereConditions = userId
      ? and(eq(yugiohCards.id, id), eq(yugiohCards.userId, userId))
      : eq(yugiohCards.id, id);

    const [card] = await db
      .select()
      .from(yugiohCards)
      .where(whereConditions)
      .limit(1);

    return card || null;
  }

  /**
   * Update a card (user must own it)
   */
  static async updateCard(
    id: number,
    userId: string,
    updates: Partial<YugiohCardData>,
    imageDataUrl?: string,
  ): Promise<YugiohCard | null> {
    // Validate Backblaze configuration
    validateBackblazeConfig();

    let imageUrl: string | null = null;

    // Upload new image to Backblaze if provided
    if (imageDataUrl) {
      try {
        const fileName = generateYugiohCardFileName(
          userId,
          updates.cardTitle || 'untitled',
        );
        imageUrl = await backblazeStorage.uploadBase64Image(
          imageDataUrl,
          fileName,
        );
      } catch (error) {
        console.error(
          'Failed to upload updated card image to Backblaze:',
          error,
        );
        throw new Error('Failed to upload updated card image');
      }
    }

    const updateData: Partial<NewYugiohCard> = {
      name: updates.cardTitle,
      description: updates.cardInfo,
      cardType: updates.cardType,
      cardSubtype: updates.cardSubtype,
      cardRare: updates.cardRare,
      holo: updates.holo,
      titleColor: updates.titleColor,
      uiLang: updates.uiLang,
      cardLang: updates.cardLang,
      infoSize: updates.infoSize,
      cardEditorState: updates,
      updatedAt: new Date(),
    };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;
      updateData.imageData = { url: imageUrl }; // Keep for compatibility
    }

    const [updatedCard] = await db
      .update(yugiohCards)
      .set(updateData)
      .where(and(eq(yugiohCards.id, id), eq(yugiohCards.userId, userId)))
      .returning();

    return updatedCard || null;
  }

  /**
   * Delete a card (user must own it)
   */
  static async deleteCard(id: number, userId: string): Promise<boolean> {
    const [deletedCard] = await db
      .delete(yugiohCards)
      .where(and(eq(yugiohCards.id, id), eq(yugiohCards.userId, userId)))
      .returning({ id: yugiohCards.id });

    return !!deletedCard;
  }

  /**
   * Toggle public/private status
   */
  static async toggleVisibility(
    id: number,
    userId: string,
  ): Promise<YugiohCard | null> {
    // First get current visibility status
    const card = await this.getCardById(id, userId);
    if (!card) return null;

    const [updatedCard] = await db
      .update(yugiohCards)
      .set({
        isPublic: !card.isPublic,
        updatedAt: new Date(),
      })
      .where(and(eq(yugiohCards.id, id), eq(yugiohCards.userId, userId)))
      .returning();

    return updatedCard || null;
  }

  /**
   * Get public cards for gallery
   */
  static async getPublicCards(limit = 20, offset = 0): Promise<YugiohCard[]> {
    return await db
      .select()
      .from(yugiohCards)
      .where(eq(yugiohCards.isPublic, true))
      .orderBy(desc(yugiohCards.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

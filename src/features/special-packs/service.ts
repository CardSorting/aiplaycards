import { db } from '../../db';

export interface SpecialPackCategory {
  id: number;
  name: string;
  description?: string | null;
  color: string | null;
  packCount: number;
}

export interface SpecialPack {
  id: number;
  categoryId?: number | null;
  categoryName?: string;
  categoryColor?: string | null;
  creditCost?: number;
  cards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    rarity: string;
  }>;
  createdAt: Date;
}

export interface ClaimResult {
  success: boolean;
  pack?: SpecialPack;
  error?: string;
}

export class SpecialPackService {
  /**
   * Get all categories that have available packs for a specific user
   */
  static async getAvailableCategories(
    _userId: string,
  ): Promise<SpecialPackCategory[]> {
    // Stubbed - no admin packs available
    return [];
  }

  /**
   * Get all available packs for a user in a specific category
   */
  static async getPacksByCategory(
    _userId: string,
    _categoryId?: number,
  ): Promise<SpecialPack[]> {
    // Stubbed - no admin packs available
    return [];
  }

  /**
   * Claim a specific pack
   */
  static async claimPack(_userId: string, _packId: number): Promise<ClaimResult> {
    // Stubbed - no admin packs available
    return {
      success: false,
      error: 'Pack claiming is not available',
    };
  }

  /**
   * Get individual pack details for viewing/opening
   */
  static async getPackDetails(_userId: string, _packId: number) {
    // Stubbed - no admin packs available
    return null;
  }

  /**
   * Get all categories (for navigation/routing purposes)
   */
  static async getAllActiveCategories(): Promise<
    Array<{ id: number; name: string; color: string | null }>
  > {
    // Stubbed - no admin packs available
    return [];
  }
}

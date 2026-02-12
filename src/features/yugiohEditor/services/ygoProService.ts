interface YgoProCardData {
  id: number;
  name: string;
  type: string;
  frameType: string;
  desc: string;
  atk?: number;
  def?: number;
  level?: number;
  race: string;
  attribute?: string;
  scale?: number;
  linkval?: number;
  linkmarkers?: string[];
  archetype?: string;
  banlist_info?: {
    ban_tcg?: string;
    ban_ocg?: string;
  };
  card_sets?: Array<{
    set_name: string;
    set_code: string;
    set_rarity: string;
    set_rarity_code: string;
    set_price: string;
  }>;
  card_prices?: Array<{
    cardmarket_price: string;
    tcgplayer_price: string;
    ebay_price: string;
    amazon_price: string;
    coolstuffinc_price: string;
  }>;
}

interface YgoProApiResponse {
  data: YgoProCardData[];
}

interface CachedCard {
  data: YgoProCardData;
  timestamp: number;
}

class YgoProService {
  private cache = new Map<string, CachedCard>();
  private readonly CACHE_DURATION = 2 * 24 * 60 * 60 * 1000; // 2 days as recommended
  private readonly BASE_URL = 'https://db.ygoprodeck.com/api/v7/cardinfo.php';

  async searchCardByName(cardName: string): Promise<YgoProCardData | null> {
    if (!cardName.trim()) {
      return null;
    }

    const cacheKey = `name:${cardName.toLowerCase()}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.BASE_URL}?name=${encodeURIComponent(cardName)}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400) {
          // Card not found
          return null;
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiResponse: YgoProApiResponse = await response.json();

      if (!apiResponse.data || apiResponse.data.length === 0) {
        return null;
      }

      // Get the first card (exact match should be first)
      const cardData = apiResponse.data[0];

      // Cache the result
      this.cache.set(cacheKey, {
        data: cardData,
        timestamp: Date.now(),
      });

      return cardData;
    } catch (error) {
      console.error('Error fetching card data:', error);
      return null;
    }
  }

  async searchCardById(cardId: string): Promise<YgoProCardData | null> {
    if (!cardId.trim()) {
      return null;
    }

    const cacheKey = `id:${cardId}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const url = `${this.BASE_URL}?id=${encodeURIComponent(cardId)}`;
      const response = await fetch(url);

      if (!response.ok) {
        if (response.status === 400) {
          // Card not found
          return null;
        }
        throw new Error(`API request failed: ${response.status}`);
      }

      const apiResponse: YgoProApiResponse = await response.json();

      if (!apiResponse.data || apiResponse.data.length === 0) {
        return null;
      }

      const cardData = apiResponse.data[0];

      // Cache the result
      this.cache.set(cacheKey, {
        data: cardData,
        timestamp: Date.now(),
      });

      return cardData;
    } catch (error) {
      console.error('Error fetching card data:', error);
      return null;
    }
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheSize(): number {
    return this.cache.size;
  }

  private cleanExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp >= this.CACHE_DURATION) {
        this.cache.delete(key);
      }
    }
  }
}

export const ygoProService = new YgoProService();
export type { YgoProCardData };

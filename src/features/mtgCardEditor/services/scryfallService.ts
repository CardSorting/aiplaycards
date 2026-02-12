interface ScryfallCardData {
  id: string;
  oracle_id: string;
  name: string;
  lang: string;
  released_at: string;
  uri: string;
  scryfall_uri: string;
  layout: string;
  highres_image?: boolean;
  image_status: string;
  mana_cost?: string;
  cmc: number;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  color_identity: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  set: string;
  set_name: string;
  set_type: string;
  set_uri: string;
  set_search_uri: string;
  scryfall_set_uri: string;
  rulings_uri: string;
  prints_search_uri: string;
  collector_number: string;
  digital: boolean;
  rarity: string;
  flavor_text?: string;
  artist?: string;
  artist_ids?: string[];
  illustration_id?: string;
  border_color: string;
  frame: string;
  full_art?: boolean;
  textless?: boolean;
  booster: boolean;
  story_spotlight: boolean;
  prices: {
    usd?: string;
    usd_foil?: string;
    usd_etched?: string;
    eur?: string;
    eur_foil?: string;
    tix?: string;
  };
  legalities: Record<string, string>;
  games: string[];
  reserved: boolean;
  foil: boolean;
  nonfoil: boolean;
  finishes: string[];
  oversized: boolean;
  promo: boolean;
  reprint: boolean;
  variation: boolean;
  card_faces?: ScryfallCardFace[];
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

interface ScryfallCardFace {
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  colors?: string[];
  power?: string;
  toughness?: string;
  loyalty?: string;
  flavor_text?: string;
  illustration_id?: string;
  image_uris?: {
    small: string;
    normal: string;
    large: string;
    png: string;
    art_crop: string;
    border_crop: string;
  };
}

interface ScryfallError {
  object: 'error';
  code: string;
  status: number;
  warnings?: string[];
  details: string;
}

interface CachedCard {
  data: ScryfallCardData;
  timestamp: number;
}

class ScryfallService {
  private cache = new Map<string, CachedCard>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours as recommended
  private readonly BASE_URL = 'https://api.scryfall.com';
  private readonly REQUEST_DELAY = 100; // 100ms delay as recommended
  private lastRequestTime = 0;

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.REQUEST_DELAY) {
      const delay = this.REQUEST_DELAY - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    this.lastRequestTime = Date.now();
  }

  private async makeRequest(url: string): Promise<ScryfallCardData> {
    await this.throttleRequest();

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'PlayMoreTCG-MTGEditor/1.0',
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Card not found');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      throw new Error(`API request failed: ${response.status}`);
    }

    const data = await response.json();

    if (data.object === 'error') {
      const error = data as ScryfallError;
      throw new Error(error.details);
    }

    return data as ScryfallCardData;
  }

  async searchCardByName(
    cardName: string,
    exact = false,
  ): Promise<ScryfallCardData | null> {
    if (!cardName.trim()) {
      return null;
    }

    const cacheKey = `${exact ? 'exact' : 'fuzzy'}:${cardName.toLowerCase()}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const searchParam = exact ? 'exact' : 'fuzzy';
      const url = `${
        this.BASE_URL
      }/cards/named?${searchParam}=${encodeURIComponent(cardName)}`;

      const cardData = await this.makeRequest(url);

      // Cache the result
      this.cache.set(cacheKey, {
        data: cardData,
        timestamp: Date.now(),
      });

      return cardData;
    } catch (error) {
      if (error instanceof Error && error.message === 'Card not found') {
        return null;
      }
      console.error('Error fetching card data:', error);
      throw error;
    }
  }

  async searchCardByNameInSet(
    cardName: string,
    setCode: string,
    exact = false,
  ): Promise<ScryfallCardData | null> {
    if (!cardName.trim() || !setCode.trim()) {
      return null;
    }

    const cacheKey = `${
      exact ? 'exact' : 'fuzzy'
    }:${cardName.toLowerCase()}:${setCode.toLowerCase()}`;

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const searchParam = exact ? 'exact' : 'fuzzy';
      const url = `${
        this.BASE_URL
      }/cards/named?${searchParam}=${encodeURIComponent(
        cardName,
      )}&set=${encodeURIComponent(setCode)}`;

      const cardData = await this.makeRequest(url);

      // Cache the result
      this.cache.set(cacheKey, {
        data: cardData,
        timestamp: Date.now(),
      });

      return cardData;
    } catch (error) {
      if (error instanceof Error && error.message === 'Card not found') {
        return null;
      }
      console.error('Error fetching card data:', error);
      throw error;
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

export const scryfallService = new ScryfallService();
export type { ScryfallCardData, ScryfallCardFace };

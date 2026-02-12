import { CardInterface } from '@features/cardEditor/types';

export interface CardMove {
  name: string;
  energyCost: string[];
  damage?: string;
  description?: string;
}

export interface CardAbility {
  name: string;
  description: string;
  type?: 'normal' | 'v' | 'vstar';
}

export interface CardWeakness {
  type: string;
  value?: string;
}

export interface CardResistance {
  type: string;
  value?: string;
}

export interface DexStats {
  height?: string;
  weight?: string;
  category?: string;
}

export interface CropData {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rotation?: number;
  scaleX?: number;
  scaleY?: number;
}

export interface CardImageData {
  backgroundImg?: string;
  imgLayer1?: string;
  imgLayer2?: string;
  prevolveImg?: string;
  cropData?: {
    backgroundImg?: CropData;
    imgLayer1?: CropData;
    imgLayer2?: CropData;
  };
}

// API Request/Response types
export interface CreateCardRequest {
  name: string;
  description?: string;
  type: string;
  subtype?: string;
  supertype: string;
  rarity?: string;
  hitpoints?: number;
  cardNumber?: string;
  totalInSet?: number;
  illustrator?: string;

  dexStats?: DexStats;
  moves?: CardMove[];
  ability?: CardAbility;
  weakness?: CardWeakness;
  resistance?: CardResistance;
  retreatCost?: number;
  imageData?: CardImageData; // Keep for backward compatibility
  cardEditorState?: CardInterface; // New field for storing complete card editor state
  backgroundImageUrl?: string; // Backblaze URL for background image
  layerImageUrl?: string; // Backblaze URL for layer image
  isPublic?: boolean;
  userId?: string;
}

export interface UpdateCardRequest extends Partial<CreateCardRequest> {
  id: number;
  cardEditorState?: CardInterface; // Full card editor state for complete reconstruction
}

export interface CardFilters {
  isPublic?: boolean;
  userId?: string;
  type?: string;
  supertype?: string;
  rarity?: string;
  limit?: number;
  offset?: number;
  excludeCustom?: boolean;
  source?: string; // Add source filter for booster/custom cards
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Database connection status
export interface DbStatus {
  connected: boolean;
  error?: string;
  timestamp: Date;
}

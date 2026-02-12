import {
  CardAbility,
  CardData,
  CardMove,
  MTGCardData,
  ResponsiveWidth,
} from './types';
import { CardInterface } from '../../features/cardEditor/types';
import { MTGCard } from '../../features/mtgCardEditor/types';

/**
 * Gets responsive widths for common card display scenarios
 * Note: For most use cases, consider using 'responsive' or 'constrained' width instead
 */
export const getResponsiveCardWidths = {
  // For grid/gallery views - container-aware
  gallery: 'constrained' as const,
  // For list views - smaller max widths
  list: { xs: 80, sm: 90, md: 100, lg: 110 },
  // For featured displays - responsive with generous max widths
  featured: 'responsive' as const,
  // For compact displays
  compact: { xs: 100, sm: 120, md: 140, lg: 160 },
  // Legacy fixed width options
  legacy: {
    gallery: { xs: 140, sm: 160, md: 180, lg: 200 },
    list: { xs: 80, sm: 90, md: 100, lg: 110 },
    featured: { xs: 200, sm: 240, md: 280, lg: 320 },
    compact: { xs: 100, sm: 120, md: 140, lg: 160 },
  },
} as const;

/**
 * Helper function to create responsive widths with consistent aspect ratio preservation
 */
export const createResponsiveWidth = (baseWidth: number): ResponsiveWidth => ({
  xs: Math.floor(baseWidth * 0.7),
  sm: Math.floor(baseWidth * 0.85),
  md: baseWidth,
  lg: Math.floor(baseWidth * 1.1),
  xl: Math.floor(baseWidth * 1.2),
});

/**
 * Generates card state for rendering, handling both new and legacy card data formats
 * This is a centralized utility that can be used across multiple pages
 */
export const generateCardState = (card: CardData) => {
  if (!card) {
    console.error('generateCardState: No card provided');
    return null;
  }

  // Normalize card data - handle different field naming conventions
  const normalizedCard = {
    id: card.id,
    name: card.cardName || card.name || '',
    type: card.cardType || card.type || '',
    subtype: card.cardSubtype || card.subtype,
    supertype: card.cardSupertype || card.supertype || '',
    rarity: card.cardRarity || card.rarity,
    hitpoints: card.hitpoints,
    isPublic: card.isPublic,
    cardEditorState: card.cardEditorState,
    imageData: card.imageData,
    illustrator: card.illustrator,
    description: card.description,
    dexStats: card.dexStats,

    ability: card.ability,
    moves: card.moves,
    // Animation fields
    animationUrl: card.animationUrl,
    animationKey: card.animationKey,
    animationPrompt: card.animationPrompt,
    animatedAt: card.animatedAt,
  };

  if (normalizedCard.cardEditorState) {
    // Check if the cardEditorState has incorrect rarity or type data
    const isCharacterRare = normalizedCard.rarity === 'Character Rare';
    const hasWrongRarity =
      isCharacterRare && normalizedCard.cardEditorState.rarityId !== 8;
    const hasWrongType =
      normalizedCard.cardEditorState.typeId === 11 &&
      normalizedCard.type !== 'Colorless'; // typeId 11 is Colorless

    if (hasWrongRarity || hasWrongType) {
      const correctedTypeId = getTypeIdFromName(normalizedCard.type);

      // Create corrected state
      const correctedState = {
        ...normalizedCard.cardEditorState,
        rarityId: isCharacterRare ? 8 : normalizedCard.cardEditorState.rarityId,
        typeId: correctedTypeId,
        typeImgId: correctedTypeId, // Fix type image as well
        rarityIconId: isCharacterRare
          ? 8
          : normalizedCard.cardEditorState.rarityIconId,
        subtypeId: 1, // Force Basic subtype which supports Character Rare for most types
      };

      return correctedState;
    } else {
      return normalizedCard.cardEditorState;
    }
  } else {
    // Fallback for older cards - create state from available data
    const fallbackState = {
      name: normalizedCard.name || '',
      subname: '',
      description: normalizedCard.description || '',
      hitpoints: normalizedCard.hitpoints || 100,
      typeId: getTypeIdFromName(normalizedCard.type),
      typeImgId: getTypeIdFromName(normalizedCard.type),
      supertypeId: getSupertypeIdFromName(normalizedCard.supertype),
      subtypeId: getSubtypeIdFromName(normalizedCard.subtype),
      rarityId: getRarityIdFromName(normalizedCard.rarity),
      rarityIconId: getRarityIdFromName(normalizedCard.rarity),
      baseSetId: 1, // Sword & Shield
      totalInSet: '100',
      cardNumber: '1',
      illustrator: normalizedCard.illustrator || 'Unknown',

      dexStats: normalizedCard.dexStats || '',
      ability: normalizedCard.ability || undefined,
      moves: normalizedCard.moves || [],
      weakness: null,
      resistance: null,
      retreatCost: 1,
      evolvesFromId: null,
      rotationId: 1,
      setIconId: 1,
    };

    return fallbackState;
  }
};

/**
 * Map type string to ID
 */
export const getTypeIdFromName = (typeName: string): number => {
  const typeMap: Record<string, number> = {
    Grass: 1,
    Fire: 2,
    Water: 3,
    Lightning: 4,
    Psychic: 5,
    Fighting: 6,
    Dark: 7,
    Metal: 8,
    Dragon: 9,
    Fairy: 10,
    Colorless: 11,
  };
  return typeMap[typeName] || 11;
};

/**
 * Map supertype string to ID
 */
export const getSupertypeIdFromName = (supertypeName: string): number => {
  return supertypeName === 'Trainer' ? 2 : supertypeName === 'Energy' ? 3 : 1;
};

/**
 * Map subtype string to ID
 */
export const getSubtypeIdFromName = (subtypeName?: string): number => {
  if (!subtypeName) return 1;
  const subtypeMap: Record<string, number> = {
    Basic: 1,
    'Stage 1': 2,
    'Stage 2': 3,
    Baby: 4,
    Restored: 5,
    'Level-Up': 6,
    MEGA: 7,
    BREAK: 8,
    GX: 9,
    'TAG TEAM': 10,
    V: 11,
    VMAX: 12,
    VSTAR: 13,
  };
  return subtypeMap[subtypeName] || 1;
};

/**
 * Map rarity string to ID
 */
export const getRarityIdFromName = (rarityName?: string): number => {
  if (!rarityName) return 1;
  const rarityMap: Record<string, number> = {
    Promo: 1,
    'Full Art': 2,
    'Golden Full Art': 3,
    Rainbow: 4,
    'Supporter Full Art': 5,
    'Gold Star': 6,
    Gilded: 7,
    'Character Rare': 8,
    Common: 1,
    Uncommon: 1,
    Rare: 1,
    'Rare Holo': 2,
    'Rare Holo EX': 2,
    'Rare Holo GX': 2,
    'Rare Holo V': 2,
    'Rare Holo VMAX': 2,
    'Rare Secret': 3,
  };
  return rarityMap[rarityName] || 1;
};

/**
 * Normalize card data from different API responses
 * This handles the different field naming conventions across different endpoints
 */
export const normalizeCardData = (
  rawCard: Record<string, unknown>,
): CardData => {
  return {
    id: (rawCard.cardId || rawCard.id) as number,
    name: (rawCard.cardName || rawCard.name || '') as string,
    type: (rawCard.cardType || rawCard.type || '') as string,
    subtype: (rawCard.cardSubtype || rawCard.subtype) as string | undefined,
    supertype: (rawCard.cardSupertype || rawCard.supertype || '') as string,
    rarity: (rawCard.cardRarity || rawCard.rarity) as string | undefined,
    hitpoints: rawCard.hitpoints as number | undefined,
    isPublic: rawCard.isPublic as boolean | undefined,
    cardEditorState: rawCard.cardEditorState as CardInterface | undefined,
    imageData: rawCard.imageData as
      | {
          dataUrl?: string;
          width?: number;
          height?: number;
          generated?: string[];
          thumbs?: string[];
        }
      | undefined,
    illustrator: rawCard.illustrator as string | undefined,
    description: rawCard.description as string | undefined,
    dexStats: rawCard.dexStats as string | undefined,

    ability: rawCard.ability as CardAbility | undefined,
    moves: rawCard.moves as
      | CardMove[]
      | { move1?: CardMove; move2?: CardMove }
      | undefined,
    createdAt: rawCard.createdAt as string | undefined,
    // Animation fields
    animationUrl: rawCard.animationUrl as string | undefined,
    animationKey: rawCard.animationKey as string | undefined,
    animationPrompt: rawCard.animationPrompt as string | undefined,
    animatedAt: rawCard.animatedAt as string | undefined,
    // Keep original field names for compatibility
    cardName: rawCard.cardName as string | undefined,
    cardType: rawCard.cardType as string | undefined,
    cardSubtype: rawCard.cardSubtype as string | undefined,
    cardSupertype: rawCard.cardSupertype as string | undefined,
    cardRarity: rawCard.cardRarity as string | undefined,
    primaryImage: rawCard.primaryImage as string | undefined,
    primaryThumb: rawCard.primaryThumb as string | undefined,
    // Preserve marketplace listing fields
    priceUsd: rawCard.priceUsd as string | undefined,
    priceCredits: rawCard.priceCredits as number | undefined,
    status: rawCard.status as string | undefined,
    sellerUserId: rawCard.sellerUserId as string | undefined,
    buyerUserId: rawCard.buyerUserId as string | undefined,
    soldAt: rawCard.soldAt as string | null | undefined,
  };
};

/**
 * Generates MTG card state for rendering, handling MTG-specific card data formats
 * This converts database MTGCardData to MTGCard format for rendering
 */
export const generateMTGCardState = (card: MTGCardData): MTGCard | null => {
  if (!card) {
    console.error('generateMTGCardState: No card provided');
    return null;
  }

  // Convert MTGCardData to MTGCard format
  const mtgCard: MTGCard = {
    id: card.id.toString(),
    name: card.name || 'Unnamed Card',
    manaCost: card.manaCost,
    convertedManaCost: card.convertedManaCost,
    type: card.type || 'Artifact',
    subTypes: card.subTypes || [],
    rarity: card.rarity || 'common',
    set: card.set || 'Custom',
    artist: card.artist,
    flavorText: card.flavorText,
    power: card.power,
    toughness: card.toughness,
    loyalty: card.loyalty,
    text: card.text,
    imageUrl: card.imageUrl || card.imageData?.dataUrl,
    layout: card.layout || 'normal',
    colors: card.colors || [],
    colorIdentity: card.colorIdentity || [],
    isToken: card.isToken || false,
  };

  return mtgCard;
};

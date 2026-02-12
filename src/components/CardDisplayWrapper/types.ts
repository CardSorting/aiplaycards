import { CardInterface } from '../../features/cardEditor/types';

export interface CardAbility {
  name: string;
  description: string;
}

export interface CardMove {
  name: string;
  description: string;
  damageAmount?: number | string;
  damage?: number | string; // Legacy property
  damageModifier?: string;
  energyCost?: Array<{ amount: number; typeId: number }>;
}

export interface CardData {
  id: number;
  name: string;
  type: string;
  subtype?: string;
  supertype: string;
  rarity?: string;
  hitpoints?: number;
  isPublic?: boolean;
  cardEditorState?: CardInterface;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  illustrator?: string;
  description?: string;
  dexStats?: string;

  ability?: CardAbility;
  moves?: CardMove[] | { move1?: CardMove; move2?: CardMove };
  createdAt?: string;
  // Animation fields
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
  // Additional fields that might come from different APIs
  cardName?: string;
  cardType?: string;
  cardSubtype?: string;
  cardSupertype?: string;
  cardRarity?: string;
  primaryImage?: string;
  primaryThumb?: string;
  // Marketplace listing fields
  priceUsd?: string;
  priceCredits?: number;
  status?: string;
  sellerUserId?: string;
  buyerUserId?: string;
  soldAt?: string | null;
}

export interface MTGCardData {
  id: number | string;
  name: string;
  manaCost?: string;
  convertedManaCost?: number;
  type: string;
  subTypes?: string[];
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  set: string;
  artist?: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  text?: string;
  imageUrl?: string;
  layout?:
    | 'normal'
    | 'full_art'
    | 'split'
    | 'flip'
    | 'transform'
    | 'modal_dfc'
    | 'meld'
    | 'leveler'
    | 'saga'
    | 'adventure'
    | 'planeswalker'
    | 'battle';
  colors?: ('W' | 'U' | 'B' | 'R' | 'G')[];
  colorIdentity?: ('W' | 'U' | 'B' | 'R' | 'G')[];
  isToken?: boolean;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  // Database fields
  cardEditorState?: any;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  // Animation fields
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
  // Marketplace listing fields
  priceUsd?: string;
  priceCredits?: number;
  status?: string;
  sellerUserId?: string;
  buyerUserId?: string;
  soldAt?: string | null;
}

export interface ResponsiveWidth {
  xs?: number;
  sm?: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export type WidthOption =
  | 'responsive' // Takes full width of container
  | 'fluid' // Alias for responsive
  | 'constrained' // Responsive with max-width constraints
  | number // Fixed width in pixels
  | ResponsiveWidth; // Custom responsive breakpoints

export interface CardDisplayWrapperProps {
  card: CardData;
  showFrame?: boolean;
  disableParallax?: boolean;
  width?: WidthOption;
  height?: number;
  aspectRatio?: string;
  enableLazyLoading?: boolean;
  skeletonHeight?: number;
  className?: string;
  children?: React.ReactNode;
  onLoad?: () => void;
  fallbackContent?: React.ReactNode;
}

export interface LazyCardRendererProps {
  card: CardData;
  isLoaded: boolean;
  onLoad: () => void;
  children: React.ReactNode;
  skeletonHeight?: number;
  threshold?: number;
  rootMargin?: string;
}

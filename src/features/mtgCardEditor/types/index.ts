export interface MTGCard {
  id: string;
  name: string;
  manaCost?: string;
  convertedManaCost?: number;
  type: string;
  subTypes?: string[];
  rarity: MTGRarity;
  set: string;
  artist?: string;
  flavorText?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  text?: string;
  imageUrl?: string;
  cardFaces?: MTGCardFace[];
  layout: MTGLayout;
  colors: MTGColor[];
  colorIdentity: MTGColor[];
  isToken?: boolean;
}

export interface MTGCardFace {
  name: string;
  manaCost?: string;
  type: string;
  text?: string;
  power?: string;
  toughness?: string;
  loyalty?: string;
  imageUrl?: string;
}

export type MTGColor = 'W' | 'U' | 'B' | 'R' | 'G';

export type MTGRarity = 'common' | 'uncommon' | 'rare' | 'mythic';

export type MTGLayout =
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

export interface MTGCardType {
  supertype?: string;
  types: string[];
  subtypes?: string[];
}

export interface MTGManaCost {
  generic?: number;
  white?: number;
  blue?: number;
  black?: number;
  red?: number;
  green?: number;
  colorless?: number;
  x?: number;
  hybrid?: Array<{
    colors: MTGColor[];
    amount: number;
  }>;
  phyrexian?: MTGColor[];
}

export interface MTGSet {
  code: string;
  name: string;
  releaseDate: string;
  type: string;
  iconUrl?: string;
}

export interface MTGFrame {
  type:
    | 'old'
    | 'modern'
    | 'future'
    | '2003'
    | '2015'
    | 'borderless'
    | 'showcase';
  effects?: string[];
}

export interface MTGCardEditor {
  card: MTGCard;
  isEditing: boolean;
  selectedFace?: number;
  errors: Record<string, string>;
}

export interface MTGCardValidation {
  isValid: boolean;
  errors: Record<string, string>;
  warnings: Record<string, string>;
}

import { MTGColor, MTGLayout, MTGRarity } from './index';

export const MTG_COLORS: Record<
  MTGColor,
  { name: string; symbol: string; hex: string }
> = {
  W: { name: 'White', symbol: '{W}', hex: '#FFFBD5' },
  U: { name: 'Blue', symbol: '{U}', hex: '#0E68AB' },
  B: { name: 'Black', symbol: '{B}', hex: '#150B00' },
  R: { name: 'Red', symbol: '{R}', hex: '#D3202A' },
  G: { name: 'Green', symbol: '{G}', hex: '#00733E' },
};

export const MTG_RARITIES: Record<
  MTGRarity,
  { name: string; symbol: string; color: string }
> = {
  common: { name: 'Common', symbol: 'C', color: '#1e1e1e' },
  uncommon: { name: 'Uncommon', symbol: 'U', color: '#c0c0c0' },
  rare: { name: 'Rare', symbol: 'R', color: '#d4af37' },
  mythic: { name: 'Mythic Rare', symbol: 'M', color: '#bf4f27' },
};

export const MTG_LAYOUTS: Record<
  MTGLayout,
  { name: string; description: string }
> = {
  normal: { name: 'Normal', description: 'Standard single-faced card' },
  full_art: {
    name: 'Full Art',
    description: 'Card without inner borders and frame',
  },
  split: {
    name: 'Split',
    description: 'Two spells on one card, separated by a line',
  },
  flip: { name: 'Flip', description: 'Card that can be played upside down' },
  transform: {
    name: 'Transform',
    description: 'Double-faced card that transforms',
  },
  modal_dfc: {
    name: 'Modal DFC',
    description: 'Double-faced card with choice',
  },
  meld: { name: 'Meld', description: 'Two cards that combine into one' },
  leveler: { name: 'Leveler', description: 'Creature with level up abilities' },
  saga: { name: 'Saga', description: 'Enchantment with chapter abilities' },
  adventure: {
    name: 'Adventure',
    description: 'Creature with adventure spell',
  },
  planeswalker: { name: 'Planeswalker', description: 'Planeswalker card' },
  battle: { name: 'Battle', description: 'Battle card' },
};

export const MTG_SUPERTYPES = ['Basic', 'Legendary', 'Snow', 'World'];

export const MTG_CARD_TYPES = [
  'Artifact',
  'Battle',
  'Creature',
  'Enchantment',
  'Instant',
  'Land',
  'Planeswalker',
  'Sorcery',
  'Tribal',
];

export const MTG_TOKEN_TYPES = [
  'Token Artifact',
  'Token Creature',
  'Token Enchantment',
];

export const MTG_CREATURE_SUBTYPES = [
  'Advisor',
  'Angel',
  'Antelope',
  'Ape',
  'Archer',
  'Archon',
  'Avatar',
  'Badger',
  'Barbarian',
  'Basilisk',
  'Beast',
  'Berserker',
  'Bird',
  'Bringer',
  'Cat',
  'Centaur',
  'Cleric',
  'Demon',
  'Dragon',
  'Drake',
  'Druid',
  'Elemental',
  'Elf',
  'Faerie',
  'Giant',
  'Goblin',
  'Human',
  'Knight',
  'Merfolk',
  'Soldier',
  'Spirit',
  'Vampire',
  'Warrior',
  'Wizard',
  'Zombie',
];

export const MTG_POPULAR_TOKEN_SUBTYPES = [
  // Creature tokens
  'Angel',
  'Beast',
  'Bird',
  'Cat',
  'Demon',
  'Dragon',
  'Elemental',
  'Elf',
  'Goblin',
  'Human',
  'Insect',
  'Knight',
  'Plant',
  'Saproling',
  'Soldier',
  'Spirit',
  'Thopter',
  'Vampire',
  'Warrior',
  'Wolf',
  'Zombie',
  // Artifact tokens
  'Equipment',
  'Treasure',
  'Clue',
  'Food',
  'Gold',
  'Powerstone',
  // Enchantment tokens
  'Aura',
  'Curse',
];

export const MTG_ARTIFACT_SUBTYPES = ['Equipment', 'Fortification', 'Vehicle'];

export const MTG_ENCHANTMENT_SUBTYPES = [
  'Aura',
  'Cartouche',
  'Class',
  'Curse',
  'Rune',
  'Saga',
  'Shrine',
];

export const MTG_LAND_SUBTYPES = [
  'Desert',
  'Forest',
  'Gate',
  'Island',
  'Mountain',
  'Plains',
  'Swamp',
  "Urza's",
];

export const MTG_PLANESWALKER_SUBTYPES = [
  'Ajani',
  'Chandra',
  'Jace',
  'Liliana',
  'Nissa',
  'Garruk',
];

export const MTG_SPELL_SUBTYPES = ['Adventure', 'Arcane', 'Trap'];

export const MANA_SYMBOLS = {
  generic: (n: number) => `{${n}}`,
  white: '{W}',
  blue: '{U}',
  black: '{B}',
  red: '{R}',
  green: '{G}',
  colorless: '{C}',
  x: '{X}',
  tap: '{T}',
  untap: '{Q}',
  energy: '{E}',
  hybrid: (color1: MTGColor, color2: MTGColor) => `{${color1}/${color2}}`,
  phyrexian: (color: MTGColor) => `{${color}/P}`,
};

export const DEFAULT_MTG_CARD = {
  id: '',
  name: '',
  type: '',
  rarity: 'common' as MTGRarity,
  set: '',
  layout: 'normal' as MTGLayout,
  colors: [] as MTGColor[],
  colorIdentity: [] as MTGColor[],
};

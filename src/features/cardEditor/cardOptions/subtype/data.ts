import { Subtype } from './index';
import { characterRare } from '../rarity';

// Pokemon types for card creation
export const pokemonTypes = [
  { id: 1, name: 'Normal' },
  { id: 2, name: 'Fighting' },
  { id: 3, name: 'Flying' },
  { id: 4, name: 'Poison' },
  { id: 5, name: 'Ground' },
  { id: 6, name: 'Rock' },
  { id: 7, name: 'Bug' },
  { id: 8, name: 'Ghost' },
  { id: 9, name: 'Steel' },
  { id: 10, name: 'Fire' },
  { id: 11, name: 'Water' },
  { id: 12, name: 'Grass' },
  { id: 13, name: 'Electric' },
  { id: 14, name: 'Psychic' },
  { id: 15, name: 'Ice' },
  { id: 16, name: 'Dragon' },
  { id: 17, name: 'Dark' },
  { id: 18, name: 'Fairy' },
];

export const basic: Subtype = {
  id: 1,
  slug: 'basic',
  displayName: 'Basic',
  logic: {
    hasDexStats: true,
    hasDexEntry: true,
    hasVariations: true,
    isVariationRequired: false,
  },
  relations: [
    ...pokemonTypes.map(t => ({
      type: t.id,
      rarities: [characterRare.id],
    })),
    {
      type: 9,
      rarities: [characterRare.id],
    },
    {
      type: 10,
      rarities: [characterRare.id],
    },
  ],
};

export const stage1: Subtype = {
  id: 2,
  slug: 'stage1',
  displayName: 'Stage 1',
  logic: {
    hasPrevolve: true,
    hasDexStats: true,
    hasDexEntry: true,
    hasVariations: true,
    isVariationRequired: false,
  },
  relations: [
    ...pokemonTypes.map(t => ({
      type: t.id,
      rarities: [characterRare.id],
    })),
    {
      type: 9,
      rarities: [characterRare.id],
    },
    {
      type: 10,
      rarities: [characterRare.id],
    },
  ],
};

export const stage2: Subtype = {
  id: 3,
  slug: 'stage2',
  displayName: 'Stage 2',
  logic: {
    hasPrevolve: true,
    hasDexStats: true,
    hasDexEntry: true,
    hasVariations: true,
    isVariationRequired: false,
  },
  relations: [
    ...pokemonTypes.map(t => ({
      type: t.id,
      rarities: [characterRare.id],
    })),
    {
      type: 9,
      rarities: [characterRare.id],
    },
    {
      type: 10,
      rarities: [characterRare.id],
    },
  ],
};

export const tool: Subtype = {
  id: 7,
  slug: 'tool',
  displayName: 'Tool',
  styles: {
    positions: {
      description: {
        top: '61%',
        height: '20%',
      },
    },
  },
  relations: [
    {
      type: 12,
      rarities: [],
    },
  ],
};

export const subtypes: Subtype[] = [basic, stage1, stage2, tool];

// MTG Card Editor Design System
// Centralized export for all styling utilities, tokens, and components

// Design Tokens
export { designTokens } from './tokens';
export type { ColorToken, SpacingToken, RadiusToken } from './tokens';
import { designTokens } from './tokens';
import type { RadiusToken, SpacingToken } from './tokens';

// Component Variants
export {
  buttonVariants,
  cardVariants,
  inputVariants,
  formSectionVariants,
  badgeVariants,
  animationVariants,
} from './variants';

export type {
  ButtonVariants,
  CardVariants,
  InputVariants,
  FormSectionVariants,
  BadgeVariants,
  AnimationVariants,
} from './variants';

// Utility functions for working with the design system
export const getColorValue = (colorPath: string, opacity?: number) => {
  const paths = colorPath.split('.');
  let value: any = designTokens.colors;

  for (const path of paths) {
    if (value && typeof value === 'object') {
      value = value[path];
    } else {
      return undefined;
    }
  }

  if (typeof value === 'string' && opacity !== undefined) {
    // Add opacity to hex colors
    if (value.startsWith('#')) {
      const alpha = Math.round(opacity * 255)
        .toString(16)
        .padStart(2, '0');
      return `${value}${alpha}`;
    }
    // Add opacity to hsl/rgb colors
    if (value.includes('hsl') || value.includes('rgb')) {
      return value.replace(')', `, ${opacity})`);
    }
  }

  return value;
};

export const getSpacingValue = (token: SpacingToken) => {
  return designTokens.spacing[token];
};

export const getRadiusValue = (token: RadiusToken) => {
  return designTokens.borderRadius[token];
};

// Utility for combining multiple color variants (for multicolor cards)
export const combineColors = (colors: string[]) => {
  if (colors.length === 0) return 'colorless';
  if (colors.length === 1) return colors[0];
  return 'multicolor';
};

// Utility for determining card variant based on MTG properties
export const getCardVariant = (card: {
  colors?: string[];
  type?: string;
  supertypes?: string[];
}) => {
  // Check for special supertypes first
  if (card.supertypes?.includes('Legendary')) {
    return 'legendary';
  }

  // Check card type
  if (card.type?.toLowerCase().includes('planeswalker')) {
    return 'planeswalker';
  }

  if (card.type?.toLowerCase().includes('artifact')) {
    return 'artifact';
  }

  if (card.type?.toLowerCase().includes('land')) {
    return 'land';
  }

  // Check colors
  if (!card.colors || card.colors.length === 0) {
    return 'colorless';
  }

  if (card.colors.length === 1) {
    const colorMap: Record<string, string> = {
      W: 'white',
      U: 'blue',
      B: 'black',
      R: 'red',
      G: 'green',
    };
    return colorMap[card.colors[0]] || 'colorless';
  }

  return 'multicolor';
};

// Utility for getting rarity styling
export const getRarityVariant = (rarity: string) => {
  const rarityMap: Record<string, string> = {
    common: 'common',
    uncommon: 'uncommon',
    rare: 'rare',
    'mythic rare': 'mythic',
    mythic: 'mythic',
  };
  return rarityMap[rarity.toLowerCase()] || 'common';
};

// Utility for mana cost styling
export const parseManaSymbols = (manaCost: string) => {
  const symbols = manaCost.match(/\{[^}]*\}/g) || [];
  return symbols.map(symbol => {
    const inner = symbol.slice(1, -1);

    // Generic mana
    if (/^\d+$/.test(inner)) {
      return { type: 'generic', value: inner, display: inner };
    }

    // Colored mana
    const colorMap: Record<string, { color: string; symbol: string }> = {
      W: { color: 'white', symbol: '☀️' },
      U: { color: 'blue', symbol: '💧' },
      B: { color: 'black', symbol: '💀' },
      R: { color: 'red', symbol: '🔥' },
      G: { color: 'green', symbol: '🌿' },
      C: { color: 'colorless', symbol: '⬡' },
    };

    if (colorMap[inner]) {
      return {
        type: 'colored',
        color: colorMap[inner].color,
        value: inner,
        display: colorMap[inner].symbol,
      };
    }

    // Hybrid mana (simplified)
    if (inner.includes('/')) {
      return { type: 'hybrid', value: inner, display: inner };
    }

    // X costs
    if (inner === 'X') {
      return { type: 'variable', value: 'X', display: 'X' };
    }

    return { type: 'unknown', value: inner, display: inner };
  });
};

// Theme utilities
export const createThemeVariables = (theme: 'light' | 'dark' = 'light') => {
  const tokens = designTokens.colors.ui;

  return {
    '--background':
      theme === 'light' ? tokens.primary[50] : tokens.primary[900],
    '--foreground':
      theme === 'light' ? tokens.primary[900] : tokens.primary[50],
    '--primary': theme === 'light' ? tokens.primary[600] : tokens.primary[400],
    '--primary-foreground':
      theme === 'light' ? tokens.primary[50] : tokens.primary[900],
    '--secondary':
      theme === 'light' ? tokens.secondary[100] : tokens.secondary[800],
    '--secondary-foreground':
      theme === 'light' ? tokens.secondary[900] : tokens.secondary[100],
    '--accent': theme === 'light' ? tokens.accent[100] : tokens.accent[800],
    '--accent-foreground':
      theme === 'light' ? tokens.accent[900] : tokens.accent[100],
    '--border':
      theme === 'light' ? tokens.secondary[200] : tokens.secondary[700],
    '--input':
      theme === 'light' ? tokens.secondary[200] : tokens.secondary[700],
    '--ring': theme === 'light' ? tokens.primary[500] : tokens.primary[400],
  };
};

// CSS custom properties helper
export const cssVar = (property: string, fallback?: string) => {
  return `var(--${property}${fallback ? `, ${fallback}` : ''})`;
};

// Animation utilities
export const animations = {
  // Entrance animations
  fadeIn: 'animate-fade-in-up',
  scaleIn: 'animate-scale-in',

  // Hover effects
  lift: 'hover-lift',
  glow: 'hover-glow',

  // MTG-specific animations
  legendary: 'animate-legendary-shine',
  mythic: 'animate-mythic-sparkle',
  planeswalker: 'animate-planeswalker-glow',
  magical: 'animate-magical-pulse',

  // Interactive states
  interactive: 'interactive-scale',
  float: 'animate-card-float',
};

export default {
  tokens: designTokens,
  getCardVariant,
  getRarityVariant,
  parseManaSymbols,
  animations,
  cssVar,
};

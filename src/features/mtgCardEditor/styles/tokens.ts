// Design Tokens for MTG Card Editor
export const designTokens = {
  // Colors inspired by MTG mana colors and card aesthetics
  colors: {
    // MTG Mana Colors
    mana: {
      white: '#FFFBD5',
      blue: '#0E68AB',
      black: '#150B00',
      red: '#D3202A',
      green: '#00733E',
      colorless: '#CAC5C0',
      multicolor: '#F8DF81',
    },

    // Rarity Colors
    rarity: {
      common: '#1E1E1E',
      uncommon: '#C0C0C0',
      rare: '#D4AF37',
      mythic: '#FF8C00',
    },

    // Card Frame Colors
    frame: {
      artifact: '#C6C7CA',
      land: '#BEB892',
      planeswalker: '#4B0082',
      enchantment: '#FFF8DC',
      instant: '#4169E1',
      sorcery: '#CD5C5C',
    },

    // UI Theme Colors
    ui: {
      primary: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        200: '#bae6fd',
        400: '#38bdf8',
        500: '#0ea5e9',
        600: '#0284c7',
        700: '#0369a1',
        800: '#075985',
        900: '#0c4a6e',
      },
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#334155',
        800: '#1e293b',
        900: '#0f172a',
      },
      accent: {
        50: '#fdf4ff',
        100: '#fae8ff',
        200: '#f3e8ff',
        400: '#c084fc',
        500: '#a855f7',
        600: '#9333ea',
        700: '#7c3aed',
        800: '#6d28d9',
        900: '#581c87',
      },
      success: {
        50: '#f0fdf4',
        100: '#dcfce7',
        500: '#22c55e',
        600: '#16a34a',
        900: '#14532d',
      },
      warning: {
        50: '#fffbeb',
        100: '#fef3c7',
        500: '#f59e0b',
        600: '#d97706',
        900: '#78350f',
      },
      error: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',
        600: '#dc2626',
        900: '#7f1d1d',
      },
    },

    // Gradients for magical effects
    gradients: {
      magical: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      artifact: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      planeswalker: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      legendary: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    },
  },

  // Typography
  typography: {
    fontFamily: {
      display: ['Cinzel', 'serif'], // For card names and headers
      body: ['Inter', 'system-ui', 'sans-serif'], // For UI elements
      mono: ['JetBrains Mono', 'monospace'], // For mana costs
      magic: ['Matrix II', 'serif'], // For card text
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.625,
    },
  },

  // Spacing
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
    card: '0.875rem', // Special radius for card elements
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    magical:
      '0 0 20px rgba(102, 126, 234, 0.4), 0 0 40px rgba(118, 75, 162, 0.2)',
    card: '0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.08)',
  },

  // Animation
  animation: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms',
    },
    easing: {
      ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Layout
  layout: {
    cardWidth: '350px',
    cardHeight: '490px',
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
    },
  },
} as const;

// Type helpers
export type ColorToken = keyof typeof designTokens.colors.ui;
export type SpacingToken = keyof typeof designTokens.spacing;
export type RadiusToken = keyof typeof designTokens.borderRadius;

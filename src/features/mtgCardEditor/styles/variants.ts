import { type VariantProps, cva } from 'class-variance-authority';

// Button variants for MTG-themed buttons
export const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-primary text-primary-foreground shadow hover:bg-primary/90',
        destructive:
          'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        outline:
          'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
        // MTG-specific variants
        mana: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 border-2 border-blue-300',
        artifact:
          'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg hover:from-gray-500 hover:to-gray-700 border-2 border-gray-300',
        planeswalker:
          'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:from-purple-600 hover:to-pink-700 border-2 border-purple-300',
        legendary:
          'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:from-yellow-500 hover:to-orange-600 border-2 border-yellow-300',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Card variants for different MTG card types
export const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border',
        white:
          'border-yellow-200 bg-gradient-to-b from-yellow-50 to-white shadow-yellow-100',
        blue: 'border-blue-200 bg-gradient-to-b from-blue-50 to-white shadow-blue-100',
        black:
          'border-gray-800 bg-gradient-to-b from-gray-800 to-gray-900 text-white shadow-gray-700',
        red: 'border-red-200 bg-gradient-to-b from-red-50 to-white shadow-red-100',
        green:
          'border-green-200 bg-gradient-to-b from-green-50 to-white shadow-green-100',
        colorless:
          'border-gray-300 bg-gradient-to-b from-gray-100 to-white shadow-gray-200',
        multicolor:
          'border-gradient-to-r from-purple-200 via-blue-200 to-red-200 bg-gradient-to-br from-purple-50 via-blue-50 to-red-50',
        artifact:
          'border-gray-400 bg-gradient-to-b from-gray-200 to-gray-100 shadow-gray-300',
        land: 'border-green-300 bg-gradient-to-b from-green-100 to-yellow-50 shadow-green-200',
        planeswalker:
          'border-purple-300 bg-gradient-to-b from-purple-100 to-indigo-50 shadow-purple-200',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        preview: 'p-2', // For card previews
      },
      rarity: {
        common: 'shadow-md',
        uncommon: 'shadow-lg shadow-gray-400/20',
        rare: 'shadow-lg shadow-yellow-400/30 ring-1 ring-yellow-200',
        mythic:
          'shadow-xl shadow-orange-400/40 ring-2 ring-orange-300 bg-gradient-to-br from-orange-50 to-red-50',
      },
      interactive: {
        none: '',
        hover: 'hover:scale-105 hover:shadow-lg cursor-pointer',
        selected: 'ring-2 ring-blue-500 scale-105 shadow-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rarity: 'common',
      interactive: 'none',
    },
  },
);

// Input variants with MTG theming
export const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input',
        mana: 'border-blue-300 focus-visible:ring-blue-500 focus-visible:border-blue-500',
        error: 'border-red-500 focus-visible:ring-red-500',
        success: 'border-green-500 focus-visible:ring-green-500',
        magical:
          'border-purple-300 focus-visible:ring-purple-500 bg-gradient-to-r from-purple-50 to-blue-50',
      },
      size: {
        default: 'h-9',
        sm: 'h-8 text-xs',
        lg: 'h-11',
        xl: 'h-12 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

// Form section variants for organizing form elements
export const formSectionVariants = cva(
  'space-y-4 rounded-lg border bg-card p-4 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-border',
        basic: 'border-blue-200 bg-blue-50/30',
        mana: 'border-purple-200 bg-purple-50/30',
        type: 'border-green-200 bg-green-50/30',
        stats: 'border-red-200 bg-red-50/30',
        text: 'border-yellow-200 bg-yellow-50/30',
        art: 'border-gray-200 bg-gray-50/30',
      },
      expanded: {
        true: 'shadow-md',
        false: 'shadow-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      expanded: false,
    },
  },
);

// Badge variants for displaying card information
export const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground',
        // MTG-specific badge variants
        white: 'border-transparent bg-yellow-100 text-yellow-800',
        blue: 'border-transparent bg-blue-100 text-blue-800',
        black: 'border-transparent bg-gray-800 text-white',
        red: 'border-transparent bg-red-100 text-red-800',
        green: 'border-transparent bg-green-100 text-green-800',
        colorless: 'border-transparent bg-gray-100 text-gray-800',
        multicolor:
          'border-transparent bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800',
        common: 'border-transparent bg-gray-100 text-gray-800',
        uncommon: 'border-transparent bg-gray-300 text-gray-800',
        rare: 'border-transparent bg-yellow-100 text-yellow-800',
        mythic: 'border-transparent bg-orange-100 text-orange-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

// Animation variants for magical effects
export const animationVariants = cva('', {
  variants: {
    animation: {
      none: '',
      pulse: 'animate-pulse',
      bounce: 'animate-bounce',
      spin: 'animate-spin',
      ping: 'animate-ping',
      magical: 'animate-pulse hover:animate-none transition-all duration-500',
      float: 'hover:-translate-y-1 transition-transform duration-300',
      glow: 'hover:shadow-lg hover:shadow-blue-500/25 transition-shadow duration-300',
    },
  },
  defaultVariants: {
    animation: 'none',
  },
});

// Type exports
export type ButtonVariants = VariantProps<typeof buttonVariants>;
export type CardVariants = VariantProps<typeof cardVariants>;
export type InputVariants = VariantProps<typeof inputVariants>;
export type FormSectionVariants = VariantProps<typeof formSectionVariants>;
export type BadgeVariants = VariantProps<typeof badgeVariants>;
export type AnimationVariants = VariantProps<typeof animationVariants>;

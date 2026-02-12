import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80',
        outline: 'text-foreground border-border',
        // MTG Mana Color badges
        white:
          'border-transparent bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 shadow-sm hover:from-yellow-200 hover:to-yellow-300',
        blue: 'border-transparent bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 shadow-sm hover:from-blue-200 hover:to-blue-300',
        black:
          'border-transparent bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-sm hover:from-gray-600 hover:to-gray-700',
        red: 'border-transparent bg-gradient-to-r from-red-100 to-red-200 text-red-800 shadow-sm hover:from-red-200 hover:to-red-300',
        green:
          'border-transparent bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm hover:from-green-200 hover:to-green-300',
        colorless:
          'border-transparent bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 shadow-sm hover:from-gray-200 hover:to-gray-300',
        multicolor:
          'border-transparent bg-gradient-to-r from-purple-100 via-blue-100 to-red-100 text-purple-800 shadow-sm hover:from-purple-200 hover:via-blue-200 hover:to-red-200',
        // Rarity badges
        common: 'border-transparent bg-gray-100 text-gray-700 shadow-sm',
        uncommon:
          'border-transparent bg-gradient-to-r from-gray-200 to-gray-300 text-gray-800 shadow-sm ring-1 ring-gray-300/50',
        rare: 'border-transparent bg-gradient-to-r from-yellow-200 to-yellow-300 text-yellow-900 shadow-md ring-1 ring-yellow-400/50',
        mythic:
          'border-transparent bg-gradient-to-r from-orange-200 to-red-300 text-orange-900 shadow-lg ring-2 ring-orange-400/50 animate-pulse hover:animate-none',
        // Card type badges
        creature:
          'border-transparent bg-gradient-to-r from-green-100 to-emerald-200 text-green-800 shadow-sm',
        instant:
          'border-transparent bg-gradient-to-r from-blue-100 to-cyan-200 text-blue-800 shadow-sm',
        sorcery:
          'border-transparent bg-gradient-to-r from-red-100 to-pink-200 text-red-800 shadow-sm',
        enchantment:
          'border-transparent bg-gradient-to-r from-purple-100 to-violet-200 text-purple-800 shadow-sm',
        artifact:
          'border-transparent bg-gradient-to-r from-gray-200 to-slate-300 text-gray-800 shadow-sm',
        planeswalker:
          'border-transparent bg-gradient-to-r from-purple-200 to-indigo-300 text-purple-800 shadow-md ring-1 ring-purple-300/50',
        land: 'border-transparent bg-gradient-to-r from-green-200 to-yellow-200 text-green-800 shadow-sm',
        // Special effects
        legendary:
          'border-transparent bg-gradient-to-r from-yellow-300 to-orange-300 text-yellow-900 shadow-lg ring-2 ring-yellow-400/60 relative overflow-hidden',
        // Status variants
        success:
          'border-transparent bg-gradient-to-r from-green-100 to-green-200 text-green-800 shadow-sm hover:from-green-200 hover:to-green-300',
        // Missing badge variants
        mana: 'border-transparent bg-gradient-to-r from-blue-200 to-purple-300 text-blue-900 shadow-sm hover:from-blue-300 hover:to-purple-400',
        type: 'border-transparent bg-gradient-to-r from-green-200 to-emerald-300 text-green-900 shadow-sm hover:from-green-300 hover:to-emerald-400',
      },
      size: {
        default: 'text-xs px-2.5 py-0.5',
        sm: 'text-xs px-2 py-0.5',
        lg: 'text-sm px-3 py-1',
        xl: 'text-base px-4 py-1.5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface MTGBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  icon?: React.ReactNode;
}

function MTGBadge({
  className,
  variant,
  size,
  icon,
  children,
  ...props
}: MTGBadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size }),
        // Add special legendary shimmer effect
        variant === 'legendary' &&
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-100%] before:animate-[shimmer_2s_infinite] before:rounded-full',
        // Add mythic glow effect
        variant === 'mythic' && 'hover:shadow-orange-400/50',
        className,
      )}
      {...props}
    >
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </div>
  );
}

export { MTGBadge, badgeVariants };

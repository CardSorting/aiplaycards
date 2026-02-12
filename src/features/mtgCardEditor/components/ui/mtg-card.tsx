import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const cardVariants = cva(
  'rounded-xl border bg-card text-card-foreground shadow transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'border-border bg-card',
        // MTG Mana Color themed cards
        white:
          'border-yellow-200/60 bg-gradient-to-b from-yellow-50/80 to-white shadow-yellow-100/50 hover:shadow-yellow-200/50',
        blue: 'border-blue-200/60 bg-gradient-to-b from-blue-50/80 to-white shadow-blue-100/50 hover:shadow-blue-200/50',
        black:
          'border-gray-600/60 bg-gradient-to-b from-gray-800/90 to-gray-900 text-white shadow-gray-700/50 hover:shadow-gray-600/50',
        red: 'border-red-200/60 bg-gradient-to-b from-red-50/80 to-white shadow-red-100/50 hover:shadow-red-200/50',
        green:
          'border-green-200/60 bg-gradient-to-b from-green-50/80 to-white shadow-green-100/50 hover:shadow-green-200/50',
        colorless:
          'border-gray-300/60 bg-gradient-to-b from-gray-100/80 to-white shadow-gray-200/50 hover:shadow-gray-300/50',
        multicolor:
          'border-purple-200/60 bg-gradient-to-br from-purple-50/60 via-blue-50/60 to-red-50/60 shadow-purple-200/50 hover:shadow-purple-300/50',
        // Special card types
        artifact:
          'border-gray-400/60 bg-gradient-to-b from-gray-200/80 to-gray-100/90 shadow-gray-300/50 hover:shadow-gray-400/50',
        land: 'border-green-300/60 bg-gradient-to-b from-green-100/80 to-yellow-50/80 shadow-green-200/50 hover:shadow-green-300/50',
        planeswalker:
          'border-purple-300/60 bg-gradient-to-b from-purple-100/80 to-indigo-50/80 shadow-purple-200/50 hover:shadow-purple-400/50',
        // Form section variants
        section: 'border-border/50 bg-card/50 backdrop-blur-sm',
        // Missing card variants
        art: 'border-gray-200/60 bg-gradient-to-b from-gray-50/80 to-slate-50/80 shadow-gray-100/50 hover:shadow-gray-200/50',
      },
      size: {
        default: 'p-6',
        sm: 'p-4',
        lg: 'p-8',
        xl: 'p-12',
        compact: 'p-3',
        preview: 'p-2',
      },
      rarity: {
        common: 'shadow-md',
        uncommon: 'shadow-lg shadow-gray-400/20 ring-1 ring-gray-200/50',
        rare: 'shadow-lg shadow-yellow-400/30 ring-1 ring-yellow-300/60',
        mythic:
          'shadow-xl shadow-orange-400/40 ring-2 ring-orange-300/60 relative overflow-hidden',
      },
      interactive: {
        none: '',
        hover: 'hover:scale-[1.02] hover:shadow-lg cursor-pointer',
        selected:
          'ring-2 ring-blue-500/60 scale-[1.02] shadow-lg shadow-blue-200/50',
        clickable:
          'hover:scale-[1.01] hover:shadow-md cursor-pointer active:scale-[0.99]',
      },
      elevation: {
        flat: 'shadow-none',
        low: 'shadow-sm',
        medium: 'shadow-md',
        high: 'shadow-lg',
        floating: 'shadow-xl shadow-black/10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rarity: 'common',
      interactive: 'none',
      elevation: 'medium',
    },
  },
);

export interface MTGCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean;
}

const MTGCard = React.forwardRef<HTMLDivElement, MTGCardProps>(
  (
    { className, variant, size, rarity, interactive, elevation, ...props },
    ref,
  ) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, size, rarity, interactive, elevation }),
        // Add mythic rare special effect
        rarity === 'mythic' &&
          'before:absolute before:inset-0 before:bg-gradient-to-r before:from-orange-400/20 before:via-transparent before:to-red-400/20 before:animate-pulse before:rounded-xl',
        className,
      )}
      {...props}
    />
  ),
);
MTGCard.displayName = 'MTGCard';

const MTGCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
MTGCardHeader.displayName = 'MTGCardHeader';

const MTGCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn('font-semibold leading-none tracking-tight', className)}
    {...props}
  />
));
MTGCardTitle.displayName = 'MTGCardTitle';

const MTGCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
MTGCardDescription.displayName = 'MTGCardDescription';

const MTGCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
MTGCardContent.displayName = 'MTGCardContent';

const MTGCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
MTGCardFooter.displayName = 'MTGCardFooter';

export {
  MTGCard,
  MTGCardHeader,
  MTGCardFooter,
  MTGCardTitle,
  MTGCardDescription,
  MTGCardContent,
  cardVariants,
};

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
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
        // MTG-specific variants with magical styling
        mana: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg hover:from-blue-600 hover:to-purple-700 hover:scale-105 transition-all duration-300 border border-blue-300/50',
        artifact:
          'bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow-lg hover:from-gray-500 hover:to-gray-700 hover:scale-105 transition-all duration-300 border border-gray-300/50',
        planeswalker:
          'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg hover:from-purple-600 hover:to-pink-700 hover:scale-105 transition-all duration-300 border border-purple-300/50 animate-pulse hover:animate-none',
        legendary:
          'bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:from-yellow-500 hover:to-orange-600 hover:scale-105 transition-all duration-300 border border-yellow-300/50 shadow-yellow-400/25',
        white:
          'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 hover:from-yellow-200 hover:to-yellow-300 hover:scale-105 shadow-sm',
        blue: 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300 hover:from-blue-200 hover:to-blue-300 hover:scale-105 shadow-sm',
        black:
          'bg-gradient-to-r from-gray-800 to-gray-900 text-white border border-gray-600 hover:from-gray-700 hover:to-gray-800 hover:scale-105 shadow-sm',
        red: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300 hover:from-red-200 hover:to-red-300 hover:scale-105 shadow-sm',
        green:
          'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300 hover:from-green-200 hover:to-green-300 hover:scale-105 shadow-sm',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-10 rounded-md px-8',
        xl: 'h-12 rounded-lg px-10 text-base font-semibold',
        icon: 'h-9 w-9',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface MTGButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const MTGButton = React.forwardRef<HTMLButtonElement, MTGButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
MTGButton.displayName = 'MTGButton';

export { MTGButton, buttonVariants };

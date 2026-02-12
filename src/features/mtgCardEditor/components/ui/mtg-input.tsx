import * as React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const inputVariants = cva(
  'flex w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        // MTG themed input variants
        mana: 'border-blue-300/60 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-gradient-to-r from-blue-50/50 to-purple-50/50',
        artifact:
          'border-gray-300/60 focus-visible:ring-gray-500 focus-visible:border-gray-500 bg-gradient-to-r from-gray-50/50 to-slate-50/50',
        planeswalker:
          'border-purple-300/60 focus-visible:ring-purple-500 focus-visible:border-purple-500 bg-gradient-to-r from-purple-50/50 to-pink-50/50',
        legendary:
          'border-yellow-300/60 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 bg-gradient-to-r from-yellow-50/50 to-orange-50/50',
        // State variants
        error: 'border-red-500/60 focus-visible:ring-red-500 bg-red-50/30',
        success:
          'border-green-500/60 focus-visible:ring-green-500 bg-green-50/30',
        warning:
          'border-orange-500/60 focus-visible:ring-orange-500 bg-orange-50/30',
        // Special effects
        magical:
          'border-purple-300/60 focus-visible:ring-purple-500 bg-gradient-to-r from-purple-50/30 via-blue-50/30 to-indigo-50/30 hover:shadow-sm hover:shadow-purple-200/50',
        // Missing variants
        text: 'border-yellow-300/60 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 bg-gradient-to-r from-yellow-50/30 to-orange-50/30',
        stats:
          'border-red-300/60 focus-visible:ring-red-500 focus-visible:border-red-500 bg-gradient-to-r from-red-50/30 to-pink-50/30',
        art: 'border-gray-300/60 focus-visible:ring-gray-500 focus-visible:border-gray-500 bg-gradient-to-r from-gray-50/30 to-slate-50/30',
        type: 'border-green-300/60 focus-visible:ring-green-500 focus-visible:border-green-500 bg-gradient-to-r from-green-50/30 to-emerald-50/30',
      },
      size: {
        default: 'h-9',
        sm: 'h-8 text-xs px-2',
        lg: 'h-11 px-4 text-base',
        xl: 'h-12 px-5 text-lg',
      },
      state: {
        default: '',
        focused: 'ring-2 ring-offset-2',
        disabled: 'opacity-50 cursor-not-allowed',
        readonly: 'bg-muted cursor-default',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      state: 'default',
    },
  },
);

export interface MTGInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

const MTGInput = React.forwardRef<HTMLInputElement, MTGInputProps>(
  ({ className, variant, size, state, type, icon, suffix, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            inputVariants({ variant, size, state }),
            icon && 'pl-9',
            suffix && 'pr-9',
            className,
          )}
          ref={ref}
          {...props}
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none">
            {suffix}
          </div>
        )}
      </div>
    );
  },
);
MTGInput.displayName = 'MTGInput';

// Textarea variant with MTG theming
const textareaVariants = cva(
  'flex min-h-[60px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 resize-none',
  {
    variants: {
      variant: {
        default: 'border-input focus-visible:ring-ring',
        mana: 'border-blue-300/60 focus-visible:ring-blue-500 focus-visible:border-blue-500 bg-gradient-to-br from-blue-50/30 to-purple-50/30',
        artifact:
          'border-gray-300/60 focus-visible:ring-gray-500 focus-visible:border-gray-500 bg-gradient-to-br from-gray-50/30 to-slate-50/30',
        planeswalker:
          'border-purple-300/60 focus-visible:ring-purple-500 focus-visible:border-purple-500 bg-gradient-to-br from-purple-50/30 to-pink-50/30',
        legendary:
          'border-yellow-300/60 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 bg-gradient-to-br from-yellow-50/30 to-orange-50/30',
        error: 'border-red-500/60 focus-visible:ring-red-500 bg-red-50/20',
        success:
          'border-green-500/60 focus-visible:ring-green-500 bg-green-50/20',
        magical:
          'border-purple-300/60 focus-visible:ring-purple-500 bg-gradient-to-br from-purple-50/20 via-blue-50/20 to-indigo-50/20',
        // Missing variants for textarea
        text: 'border-yellow-300/60 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 bg-gradient-to-br from-yellow-50/20 to-orange-50/20',
      },
      size: {
        default: 'min-h-[80px]',
        sm: 'min-h-[60px] text-xs',
        lg: 'min-h-[120px] text-base',
        xl: 'min-h-[160px] text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export interface MTGTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {}

const MTGTextarea = React.forwardRef<HTMLTextAreaElement, MTGTextareaProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <textarea
        className={cn(textareaVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  },
);
MTGTextarea.displayName = 'MTGTextarea';

export { MTGInput, MTGTextarea, inputVariants, textareaVariants };

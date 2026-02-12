import * as React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { MTGCard } from './mtg-card';

const formSectionVariants = cva('transition-all duration-300 ease-out', {
  variants: {
    variant: {
      default: '',
      // MTG-themed form sections
      basic: 'border-blue-200/40 bg-gradient-to-br from-blue-50/30 to-white/80',
      mana: 'border-purple-200/40 bg-gradient-to-br from-purple-50/30 to-blue-50/30',
      type: 'border-green-200/40 bg-gradient-to-br from-green-50/30 to-emerald-50/30',
      stats: 'border-red-200/40 bg-gradient-to-br from-red-50/30 to-pink-50/30',
      text: 'border-yellow-200/40 bg-gradient-to-br from-yellow-50/30 to-orange-50/30',
      art: 'border-gray-200/40 bg-gradient-to-br from-gray-50/30 to-slate-50/30',
      planeswalker:
        'border-purple-300/40 bg-gradient-to-br from-purple-50/40 to-indigo-50/40',
      legendary:
        'border-yellow-300/40 bg-gradient-to-br from-yellow-50/40 to-orange-50/40',
    },
    size: {
      default: 'p-4',
      sm: 'p-3',
      lg: 'p-6',
      xl: 'p-8',
    },
    state: {
      default: '',
      expanded: 'shadow-md',
      collapsed: 'shadow-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
    state: 'default',
  },
});

const headerVariants = cva(
  'flex items-center justify-between w-full p-0 font-semibold text-left transition-all duration-200 hover:opacity-80 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-md',
  {
    variants: {
      variant: {
        default: 'text-foreground',
        basic: 'text-blue-700 hover:text-blue-800',
        mana: 'text-purple-700 hover:text-purple-800',
        type: 'text-green-700 hover:text-green-800',
        stats: 'text-red-700 hover:text-red-800',
        text: 'text-yellow-700 hover:text-yellow-800',
        art: 'text-gray-700 hover:text-gray-800',
        planeswalker: 'text-purple-800 hover:text-purple-900',
        legendary: 'text-yellow-800 hover:text-yellow-900',
      },
      size: {
        default: 'text-lg py-2',
        sm: 'text-base py-1.5',
        lg: 'text-xl py-3',
        xl: 'text-2xl py-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

interface MTGFormSectionProps
  extends React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Root>,
    VariantProps<typeof formSectionVariants> {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  defaultExpanded?: boolean;
  headerVariant?: VariantProps<typeof headerVariants>['variant'];
  headerSize?: VariantProps<typeof headerVariants>['size'];
}

const MTGFormSection = React.forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Root>,
  MTGFormSectionProps
>(
  (
    {
      className,
      variant,
      size,
      state: _state,
      title,
      description,
      icon,
      defaultExpanded = false,
      headerVariant,
      headerSize,
      children,
      ...props
    },
    ref,
  ) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

    return (
      <CollapsiblePrimitive.Root
        ref={ref}
        open={isExpanded}
        onOpenChange={setIsExpanded}
        className="w-full"
        {...props}
      >
        <MTGCard
          className={cn(
            formSectionVariants({
              variant,
              size,
              state: isExpanded ? 'expanded' : 'collapsed',
            }),
            className,
          )}
          variant="section"
          size={size}
          elevation={isExpanded ? 'medium' : 'low'}
        >
          <CollapsiblePrimitive.Trigger asChild>
            <button
              className={cn(
                headerVariants({
                  variant: headerVariant || variant,
                  size: headerSize,
                }),
              )}
            >
              <div className="flex items-center gap-3">
                {icon && (
                  <div className="flex-shrink-0 text-current opacity-80">
                    {icon}
                  </div>
                )}
                <div className="text-left">
                  <div className="font-semibold">{title}</div>
                  {description && (
                    <div className="text-sm font-normal opacity-70 mt-0.5">
                      {description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 transition-transform duration-200">
                {isExpanded ? (
                  <ChevronDown className="h-5 w-5" />
                ) : (
                  <ChevronRight className="h-5 w-5" />
                )}
              </div>
            </button>
          </CollapsiblePrimitive.Trigger>

          <CollapsiblePrimitive.Content className="data-[state=closed]:animate-[collapsible-up_0.2s_ease-out] data-[state=open]:animate-[collapsible-down_0.2s_ease-out] overflow-hidden">
            <div className="pt-4 space-y-4">{children}</div>
          </CollapsiblePrimitive.Content>
        </MTGCard>
      </CollapsiblePrimitive.Root>
    );
  },
);

MTGFormSection.displayName = 'MTGFormSection';

export { MTGFormSection, formSectionVariants, headerVariants };

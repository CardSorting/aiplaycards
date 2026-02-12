// Main exports for the CardDisplayWrapper module
export { CardDisplayWrapper } from './PokemonCardDisplayWrapper';
export { YugiohCardDisplayWrapper } from './YugiohCardDisplayWrapper';
export { MTGCardDisplayWrapper } from './MTGCardDisplayWrapper';
export { LazyCardRenderer } from './LazyCardRenderer';
export { useCardLoadingState, usePagination } from './hooks';
export {
  generateCardState,
  generateMTGCardState,
  normalizeCardData,
  getResponsiveCardWidths,
  createResponsiveWidth,
} from './utils';
export type {
  CardData,
  MTGCardData,
  CardDisplayWrapperProps,
  LazyCardRendererProps,
  ResponsiveWidth,
  WidthOption,
} from './types';

// Re-export commonly used components for convenience
export { default as CardDisplay } from '@cardEditor/cardStyles/components/CardDisplay';
export { CardOptionsProvider } from '@cardEditor/cardOptions';
export { CardStylesProvider } from '@cardEditor/cardStyles/Context';

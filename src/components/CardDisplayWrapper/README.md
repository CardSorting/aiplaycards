# CardDisplayWrapper

A reusable component library for displaying Pokémon cards consistently across the application.

## Overview

The CardDisplayWrapper provides a unified way to render card previews with lazy loading, consistent styling, and optimized performance. It handles different data formats and provides fallbacks for missing card data.

## Components

### CardDisplayWrapper

The main wrapper component that renders a card preview with proper styling and providers.

```tsx
import { CardDisplayWrapper, getResponsiveCardWidths } from '@components/CardDisplayWrapper';

// Recommended: Fully responsive (default) - fits container
<CardDisplayWrapper
  card={cardData}
  width="responsive"
/>

// Responsive with max-width constraints for readability
<CardDisplayWrapper
  card={cardData}
  width="constrained"
/>

// Using preset configurations
<CardDisplayWrapper
  card={cardData}
  width={getResponsiveCardWidths.gallery} // 'constrained'
/>

// Custom responsive breakpoints
<CardDisplayWrapper
  card={cardData}
  width={{ xs: 120, sm: 150, md: 180, lg: 200 }}
/>

// Fixed width (legacy support)
<CardDisplayWrapper
  card={cardData}
  width={200}
/>
```

**Props:**

- `card` (CardData): The card data to render
- `showFrame` (boolean): Whether to show the card frame (default: true)
- `disableParallax` (boolean): Whether to disable parallax effects (default: true)
- `width` (WidthOption): Card width behavior:
  - `'responsive'` (default): Takes full width of container
  - `'constrained'`: Responsive with sensible max-widths
  - `'fluid'`: Alias for responsive
  - `number`: Fixed width in pixels
  - `ResponsiveWidth`: Custom breakpoint object
- `height` (number): Card height in pixels (optional, uses aspectRatio if not provided)
- `aspectRatio` (string): Card aspect ratio (default: '747/1038')
- `fallbackContent` (ReactNode): Custom fallback content when card state is unavailable
- `className` (string): CSS class name
- `onLoad` (function): Callback when card loads
- `children` (ReactNode): Additional content to render alongside the card

### LazyCardRenderer

Wraps cards with intersection observer for lazy loading optimization.

```tsx
import { LazyCardRenderer } from '@components/CardDisplayWrapper';

<LazyCardRenderer
  card={cardData}
  isLoaded={isCardLoaded(cardData.id)}
  onLoad={() => handleCardLoad(cardData.id)}
  skeletonHeight={300}
>
  <YourCardComponent />
</LazyCardRenderer>;
```

**Props:**

- `card` (CardData): The card data
- `isLoaded` (boolean): Whether the card has been loaded
- `onLoad` (function): Callback when card enters viewport
- `children` (ReactNode): The content to render when loaded
- `skeletonHeight` (number): Height of skeleton loader (default: 300)
- `threshold` (number): Intersection observer threshold (default: 0.1)
- `rootMargin` (string): Intersection observer root margin (default: '50px')

## Hooks

### useCardLoadingState

Manages loading state for multiple cards.

```tsx
import { useCardLoadingState } from '@components/CardDisplayWrapper';

const { handleCardLoad, isCardLoaded, resetLoadingState } =
  useCardLoadingState();
```

**Returns:**

- `cardsLoaded` (Set<number>): Set of loaded card IDs
- `handleCardLoad` (function): Mark a card as loaded
- `isCardLoaded` (function): Check if a card is loaded
- `resetLoadingState` (function): Reset all loading states

### usePagination

Provides pagination logic and state management.

```tsx
import { usePagination } from '@components/CardDisplayWrapper';

const { page, setPage, total, setTotal, totalPages, offset, itemsPerPage } =
  usePagination(24);
```

## Utilities

### generateCardState

Converts card data into the format expected by the card renderer.

```tsx
import { generateCardState } from '@components/CardDisplayWrapper';

const cardState = generateCardState(cardData);
```

### normalizeCardData

Normalizes card data from different API responses to a consistent format.

```tsx
import { normalizeCardData } from '@components/CardDisplayWrapper';

const normalizedCard = normalizeCardData(apiResponse);
```

### getResponsiveCardWidths

Provides pre-configured responsive width configurations for common use cases.

```tsx
import { getResponsiveCardWidths } from '@components/CardDisplayWrapper';

// Modern responsive presets (recommended):
// - gallery: 'constrained' (responsive with max-widths)
// - featured: 'responsive' (full container width)
// - list: { xs: 80, sm: 90, md: 100, lg: 110 }
// - compact: { xs: 100, sm: 120, md: 140, lg: 160 }

<CardDisplayWrapper width={getResponsiveCardWidths.gallery} />

// Legacy fixed-width presets available at:
<CardDisplayWrapper width={getResponsiveCardWidths.legacy.gallery} />
```

### createResponsiveWidth

Creates responsive width objects based on a base width with consistent scaling.

```tsx
import { createResponsiveWidth } from '@components/CardDisplayWrapper';

// Creates: { xs: 140, sm: 170, md: 200, lg: 220, xl: 240 }
const responsiveWidth = createResponsiveWidth(200);
```

## Data Types

### CardData Interface

```tsx
interface CardData {
  id: number;
  name: string;
  type: string;
  subtype?: string;
  supertype: string;
  rarity?: string;
  hitpoints?: number;
  isPublic?: boolean;
  cardEditorState?: any;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  illustrator?: string;
  description?: string;
  dexStats?: string;
  dexEntry?: string;
  ability?: any;
  moves?: any;
  // Legacy field compatibility
  cardName?: string;
  cardType?: string;
  cardSubtype?: string;
  cardSupertype?: string;
  cardRarity?: string;
  primaryImage?: string;
  primaryThumb?: string;
}
```

## Usage Examples

### Simple Card Gallery

```tsx
import {
  CardDisplayWrapper,
  LazyCardRenderer,
  useCardLoadingState,
} from '@components/CardDisplayWrapper';

function CardGallery({ cards }) {
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  return (
    <Grid container spacing={3}>
      {cards.map(card => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
          <LazyCardRenderer
            card={card}
            isLoaded={isCardLoaded(card.id)}
            onLoad={() => handleCardLoad(card.id)}
          >
            <Card>
              <Box
                sx={{
                  p: 1,
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CardDisplayWrapper card={card} />
              </Box>
              <CardContent>
                <Typography variant="h6">{card.name}</Typography>
                <Typography variant="body2">
                  {card.type} • {card.rarity}
                </Typography>
              </CardContent>
            </Card>
          </LazyCardRenderer>
        </Grid>
      ))}
    </Grid>
  );
}
```

### Marketplace Listing with Actions

```tsx
function MarketplaceListing({ listing, onEdit, onCancel }) {
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  return (
    <LazyCardRenderer
      card={listing}
      isLoaded={isCardLoaded(listing.id)}
      onLoad={() => handleCardLoad(listing.id)}
    >
      <Card>
        <Box
          sx={{
            p: 1,
            backgroundColor: '#f8f9fa',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <CardDisplayWrapper card={listing} />
        </Box>
        <CardContent>
          <Typography variant="h6">{listing.name}</Typography>
          <Stack direction="row" spacing={1}>
            <Chip label={listing.type} />
            <Chip label={`$${listing.price}`} color="success" />
          </Stack>
          <Stack direction="row" spacing={1}>
            <Button onClick={() => onEdit(listing.id)}>Edit</Button>
            <Button onClick={() => onCancel(listing.id)} color="error">
              Cancel
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </LazyCardRenderer>
  );
}
```

### Card Collection with Different Sizes

```tsx
function CardCollection({ cards, size = 'medium' }) {
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  const sizeConfig = {
    small: { width: 120, gridSize: { xs: 6, sm: 4, md: 3, lg: 2 } },
    medium: { width: 160, gridSize: { xs: 12, sm: 6, md: 4, lg: 3 } },
    large: { width: 200, gridSize: { xs: 12, sm: 6, md: 4, lg: 3 } },
  };

  const config = sizeConfig[size];

  return (
    <Grid container spacing={2}>
      {cards.map(card => (
        <Grid item {...config.gridSize} key={card.id}>
          <LazyCardRenderer
            card={card}
            isLoaded={isCardLoaded(card.id)}
            onLoad={() => handleCardLoad(card.id)}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CardDisplayWrapper card={card} width={config.width} />
            </Box>
          </LazyCardRenderer>
        </Grid>
      ))}
    </Grid>
  );
}
```

## Migration from Existing Code

To migrate from existing card display implementations:

1. **Import the new components:**

   ```tsx
   import {
     CardDisplayWrapper,
     LazyCardRenderer,
     useCardLoadingState,
   } from '@components/CardDisplayWrapper';
   ```

2. **Replace custom card state generation:**

   ```tsx
   // Old way
   const generateCardState = useCallback((card) => { ... }, []);

   // New way - handled automatically by CardDisplayWrapper
   <CardDisplayWrapper card={card} />
   ```

3. **Replace custom lazy loading:**

   ```tsx
   // Old way
   const [cardsLoaded, setCardsLoaded] = useState(new Set());
   const handleCardLoad = useCallback((cardId) => { ... }, []);

   // New way
   const { handleCardLoad, isCardLoaded } = useCardLoadingState();
   ```

4. **Update card rendering:**

   ```tsx
   // Old way
   <LazyCardRenderer card={card} generateCardState={generateCardState} ...>
     <Box>
       <CardOptionsProvider>
         <CardStylesProvider>
           <CardDisplay />
         </CardStylesProvider>
       </CardOptionsProvider>
     </Box>
   </LazyCardRenderer>

   // New way
   <LazyCardRenderer card={card} isLoaded={isCardLoaded(card.id)} onLoad={() => handleCardLoad(card.id)}>
     <Box>
       <CardDisplayWrapper card={card} />
     </Box>
   </LazyCardRenderer>
   ```

## Benefits

- **Consistency**: Same card rendering logic across all pages
- **Performance**: Built-in lazy loading and optimization
- **Maintainability**: Centralized card logic, easier to update
- **Flexibility**: Configurable sizing, styling, and behavior
- **Type Safety**: Full TypeScript support with proper interfaces
- **Compatibility**: Handles different data formats automatically
- **Reusability**: Drop-in replacement for existing card displays

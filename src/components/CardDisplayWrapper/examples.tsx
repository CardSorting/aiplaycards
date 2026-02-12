/**
 * Example implementations showing how to use CardDisplayWrapper across different pages
 * These examples demonstrate various use cases and configurations
 */

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  CardData,
  CardDisplayWrapper,
  LazyCardRenderer,
  useCardLoadingState,
} from './index';

// Example 1: Simple card gallery display
export const SimpleCardGallery = ({ cards }: { cards: CardData[] }) => {
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
                <Typography variant="h6" component="h3">
                  {card.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.type} • {card.rarity}
                </Typography>
              </CardContent>
            </Card>
          </LazyCardRenderer>
        </Grid>
      ))}
    </Grid>
  );
};

// Example 2: Marketplace listing style with actions
interface MarketplaceListing extends CardData {
  listingId: number;
  price: number;
  status: 'active' | 'sold' | 'canceled';
}

export const MarketplaceCardGrid = ({
  listings,
  onEdit,
  onCancel,
  selectedIds,
  onSelect,
}: {
  listings: MarketplaceListing[];
  onEdit?: (listingId: number) => void;
  onCancel?: (listingId: number) => void;
  selectedIds?: number[];
  onSelect?: (listingId: number, selected: boolean) => void;
}) => {
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  return (
    <Grid container spacing={3}>
      {listings.map(listing => (
        <Grid item xs={12} sm={6} md={4} lg={3} key={listing.listingId}>
          <LazyCardRenderer
            card={listing}
            isLoaded={isCardLoaded(listing.id)}
            onLoad={() => handleCardLoad(listing.id)}
          >
            <Card sx={{ position: 'relative' }}>
              {onSelect && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={
                        selectedIds?.includes(listing.listingId) || false
                      }
                      onChange={e =>
                        onSelect(listing.listingId, e.target.checked)
                      }
                    />
                  }
                  label=""
                  sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                />
              )}

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
                <Stack spacing={1}>
                  <Typography variant="h6" sx={{ fontSize: '1rem' }}>
                    {listing.name}
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ flexWrap: 'wrap' }}
                  >
                    <Chip size="small" label={listing.type} />
                    <Chip
                      size="small"
                      color="success"
                      label={`$${listing.price}`}
                    />
                    {listing.status !== 'active' && (
                      <Chip size="small" label={listing.status} />
                    )}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: 'wrap', gap: 1 }}
                  >
                    {onEdit && (
                      <Button
                        variant="text"
                        size="small"
                        onClick={() => onEdit(listing.listingId)}
                      >
                        Edit
                      </Button>
                    )}
                    {onCancel && (
                      <Button
                        variant="text"
                        size="small"
                        color="error"
                        onClick={() => onCancel(listing.listingId)}
                      >
                        Cancel
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </LazyCardRenderer>
        </Grid>
      ))}
    </Grid>
  );
};

// Example 3: Card collection/deck view with different sizes
export const CardCollectionView = ({
  cards,
  size = 'medium',
}: {
  cards: CardData[];
  size?: 'small' | 'medium' | 'large';
}) => {
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
            skeletonHeight={size === 'small' ? 200 : 300}
          >
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CardDisplayWrapper card={card} width={config.width} />
            </Box>
          </LazyCardRenderer>
        </Grid>
      ))}
    </Grid>
  );
};

// Example 4: Single card detailed view
export const CardDetailView = ({
  card,
  showDetails = true,
}: {
  card: CardData;
  showDetails?: boolean;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        gap: 3,
        flexDirection: { xs: 'column', md: 'row' },
      }}
    >
      <Box sx={{ flex: '0 0 auto', display: 'flex', justifyContent: 'center' }}>
        <CardDisplayWrapper
          card={card}
          width={300}
          showFrame={true}
          disableParallax={false}
        />
      </Box>

      {showDetails && (
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" gutterBottom>
            {card.name}
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="h6">Card Details</Typography>
              <Typography>Type: {card.type}</Typography>
              <Typography>Supertype: {card.supertype}</Typography>
              {card.subtype && <Typography>Subtype: {card.subtype}</Typography>}
              {card.rarity && <Typography>Rarity: {card.rarity}</Typography>}
              {card.hitpoints && <Typography>HP: {card.hitpoints}</Typography>}
            </Box>

            {card.description && (
              <Box>
                <Typography variant="h6">Description</Typography>
                <Typography>{card.description}</Typography>
              </Box>
            )}

            {card.illustrator && (
              <Box>
                <Typography variant="h6">Illustrator</Typography>
                <Typography>{card.illustrator}</Typography>
              </Box>
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

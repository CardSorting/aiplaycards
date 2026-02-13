'use client';
import { useSession } from 'next-auth/react';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  Divider,
  FormControlLabel,
  Grid,
  IconButton,
  Link as MUILink,
  MenuItem,
  MobileStepper,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  Typography,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  AccountBalanceWallet as CreditIcon,
  List as ListIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import {
  CardDisplayWrapper,
  LazyCardRenderer,
  useCardLoadingState,
} from '@components/CardDisplayWrapper';

interface UserCard {
  id: number;
  name: string;
  type: string;
  subtype?: string;
  supertype: string;
  rarity?: string;
  hitpoints?: number;
  isPublic?: boolean;
  createdAt: string;
  primaryImage?: string;
  primaryThumb?: string;
  listingStatus?: 'unlisted' | 'active' | 'sold' | 'canceled';
  currentListingId?: number;
  currentPrice?: number;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  cardEditorState?: any;
  illustrator?: string;
  description?: string;
  dexStats?: string;
  dexEntry?: string;
  ability?: any;
  moves?: any;
  source?: 'booster' | 'custom'; // Added source field
}

interface ListingStep {
  card: UserCard;
  price: string;
  isValid: boolean;
}

export default function CreateListingPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isMobile = useMediaQuery('(max-width:960px)');
  const isTablet = useMediaQuery('(max-width:1200px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const theme = useTheme();
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);

  // Use the card loading hook
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  // Filters and search
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sourceFilter, setSourceFilter] = useState<
    'all' | 'booster' | 'custom'
  >('all');
  const itemsPerPage = 24;

  // Selection and bulk operations
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [bulkPrice, setBulkPrice] = useState('');

  // Mobile listing flow states
  const [showMobileListingFlow, setShowMobileListingFlow] = useState(false);
  const [listingSteps, setListingSteps] = useState<ListingStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [mobileListingBusy, setMobileListingBusy] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const fetchCards = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        userId: user.id,
        limit: String(itemsPerPage),
        offset: String((page - 1) * itemsPerPage),
        view: 'full', // Get full card data for proper rendering
        // Removed excludeCustom filter to allow creator-made cards to be sold
      });

      // Include both public and private cards for owner
      // Don't set isPublic parameter to get both public and private cards

      if (searchTerm.trim()) {
        params.set('search', searchTerm.trim());
      }

      if (sourceFilter !== 'all') {
        params.set('source', sourceFilter);
      }

      const response = await fetch(`/api/cards?${params.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }

      const data = await response.json();
      const cardsWithListingStatus = await enrichCardsWithListingStatus(
        data.data,
      );

      // Always replace cards for pagination (not append)
      setCards(cardsWithListingStatus);
      setTotal(data.total || cardsWithListingStatus.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
      // Set initial render to false after first load
      if (initialRender) {
        setTimeout(() => setInitialRender(false), 100);
      }
    }
  }, [user?.id, page, searchTerm, initialRender, sourceFilter]);

  // Enrich cards with current listing status
  const enrichCardsWithListingStatus = async (
    cards: UserCard[],
  ): Promise<UserCard[]> => {
    if (!cards.length) return cards;

    try {
      const cardIds = cards.map(c => c.id);
      const response = await fetch('/api/marketplace/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardIds }),
      });

      if (!response.ok) {
        return cards.map(card => ({
          ...card,
          listingStatus: 'unlisted' as const,
        }));
      }

      const listingData = await response.json();
      const listingMap = new Map(
        listingData.data?.map((l: any) => [l.cardId, l]) || [],
      );

      return cards.map(card => {
        const listing: any = listingMap.get(card.id);
        return {
          ...card,
          listingStatus: listing
            ? (listing.status as 'active' | 'sold' | 'canceled')
            : ('unlisted' as const),
          currentListingId: listing?.id,
          currentPrice: listing?.priceCredits || undefined,
        };
      });
    } catch {
      return cards.map(card => ({
        ...card,
        listingStatus: 'unlisted' as const,
      }));
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  // Only show unlisted cards (available to list)
  const filteredCards = cards.filter(card => card.listingStatus === 'unlisted');

  const handleCardSelect = (cardId: number, selected: boolean) => {
    setSelectedCards(prev =>
      selected ? [...prev, cardId] : prev.filter(id => id !== cardId),
    );
  };

  const handleSelectAll = () => {
    const selectableCards = filteredCards.filter(
      card => card.listingStatus === 'unlisted',
    );
    const allSelected = selectableCards.every(card =>
      selectedCards.includes(card.id),
    );

    if (allSelected) {
      setSelectedCards([]);
    } else {
      setSelectedCards(selectableCards.map(card => card.id));
    }
  };

  // Mobile listing flow functions
  const startMobileListingFlow = (cards: UserCard[], defaultPrice = '100') => {
    const steps: ListingStep[] = cards.map(card => ({
      card,
      price: defaultPrice,
      isValid: !!(defaultPrice && parseInt(defaultPrice, 10) > 0),
    }));

    setListingSteps(steps);
    setCurrentStepIndex(0);
    setShowMobileListingFlow(true);
  };

  const updateStepPrice = (stepIndex: number, price: string) => {
    setListingSteps(prev =>
      prev.map((step, index) =>
        index === stepIndex
          ? { ...step, price, isValid: !!(price && parseInt(price, 10) > 0) }
          : step,
      ),
    );
  };

  const goToNextStep = () => {
    if (currentStepIndex < listingSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const handleMobileListingCreate = async () => {
    setMobileListingBusy(true);
    try {
      const promises = listingSteps.map(step =>
        fetch('/api/marketplace', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: step.card.id,
            priceCredits: parseInt(step.price, 10),
          }),
        }),
      );

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;

      if (successful > 0) {
        // Refresh cards to update listing status
        await fetchCards();
        setSelectedCards([]);
        setShowMobileListingFlow(false);
        setListingSteps([]);
        setCurrentStepIndex(0);
      }

      if (successful < listingSteps.length) {
        setError(
          `Created ${successful} of ${listingSteps.length} listings. Some may have failed.`,
        );
      }
    } catch (err) {
      setError('Failed to create listings');
    } finally {
      setMobileListingBusy(false);
    }
  };

  const closeMobileListingFlow = () => {
    if (!mobileListingBusy) {
      setShowMobileListingFlow(false);
      setListingSteps([]);
      setCurrentStepIndex(0);
    }
  };

  if (!user?.id) {
    return (
      <Container
        maxWidth="lg"
        sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}
      >
        <Alert severity="warning">Please sign in to create listings.</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MUILink component={Link} href="/">
          Home
        </MUILink>
        <MUILink component={Link} href="/marketplace">
          Marketplace
        </MUILink>
        <MUILink component={Link} href="/marketplace/manage">
          Manage
        </MUILink>
        <Typography color="text.primary">Create Listing</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Box>
          <Typography
            variant={isSmallMobile ? 'h5' : 'h4'}
            fontWeight={800}
            gutterBottom
            sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
          >
            Create New Listings
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            Select cards from your collection to list on the marketplace
          </Typography>
        </Box>
        <Stack
          direction={{ xs: 'row', sm: 'row' }}
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            component={Link}
            href="/marketplace/manage/listings"
            variant="outlined"
            startIcon={!isSmallMobile && <ListIcon />}
            size={isSmallMobile ? 'small' : 'medium'}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            {isSmallMobile ? 'Listings' : 'View Listings'}
          </Button>
        </Stack>
      </Stack>

      {/* Search and Bulk Actions */}
      <Card sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            {/* Header Row */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <Typography
                variant={isSmallMobile ? 'subtitle1' : 'h6'}
                color="primary"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '1rem', sm: '1.25rem' },
                }}
              >
                Cards Available to List
              </Typography>

              {/* Search Field */}
              <TextField
                size={isSmallMobile ? 'medium' : 'small'}
                placeholder="Search cards..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                sx={{
                  width: { xs: '100%', sm: 280 },
                  maxWidth: '100%',
                }}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              />
            </Stack>

            {/* Information about card types */}
            <Alert
              severity="info"
              sx={{ mb: 3 }}
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  {showInstructions ? 'Hide' : 'Show'} Info
                </Button>
              }
            >
              <Typography variant="body2">
                You can now sell both <strong>booster pack cards</strong> and{' '}
                <strong>creator-made cards</strong> on the marketplace!
                Creator-made cards are marked with a "Creator" badge, while
                booster pack cards show "Booster".
              </Typography>
            </Alert>

            {/* Source Filter */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 2, sm: 3 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              sx={{ mb: 3 }}
            >
              <Typography variant="body2" color="text.secondary">
                Filter by source:
              </Typography>
              <TextField
                select
                size="small"
                value={sourceFilter}
                onChange={e =>
                  setSourceFilter(
                    e.target.value as 'all' | 'booster' | 'custom',
                  )
                }
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="all">All Cards</MenuItem>
                <MenuItem value="booster">Booster Pack Only</MenuItem>
                <MenuItem value="custom">Creator-Made Only</MenuItem>
              </TextField>
            </Stack>

            {/* Bulk Actions Row */}
            {filteredCards.length > 0 && (
              <>
                {!isSmallMobile && <Divider />}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 2, sm: 1 }}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                  sx={{ flexWrap: 'wrap' }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={filteredCards.every(c =>
                          selectedCards.includes(c.id),
                        )}
                        indeterminate={
                          selectedCards.length > 0 &&
                          selectedCards.length < filteredCards.length
                        }
                        onChange={handleSelectAll}
                        size={isSmallMobile ? 'medium' : 'small'}
                      />
                    }
                    label="Select All"
                    sx={{
                      mr: { xs: 0, sm: 2 },
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.9rem', sm: '0.875rem' },
                      },
                    }}
                  />

                  {selectedCards.length > 0 && (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={1}
                      sx={{
                        flex: 1,
                        alignItems: { xs: 'stretch', sm: 'center' },
                        p: { xs: 2, sm: 0 },
                        backgroundColor: {
                          xs: alpha(theme.palette.primary.main, 0.05),
                          sm: 'transparent',
                        },
                        borderRadius: { xs: 2, sm: 0 },
                        border: {
                          xs: `1px solid ${alpha(
                            theme.palette.primary.main,
                            0.1,
                          )}`,
                          sm: 'none',
                        },
                      }}
                    >
                      {isMobile && (
                        <Typography
                          variant="body2"
                          color="primary"
                          sx={{
                            textAlign: 'center',
                            fontWeight: 600,
                            mb: { xs: 1, sm: 0 },
                          }}
                        >
                          {selectedCards.length} card
                          {selectedCards.length !== 1 ? 's' : ''} selected
                        </Typography>
                      )}
                      <TextField
                        size={isSmallMobile ? 'medium' : 'small'}
                        label="Bulk Price (Credits)"
                        type="number"
                        value={bulkPrice}
                        onChange={e => setBulkPrice(e.target.value)}
                        sx={{
                          width: { xs: '100%', sm: 140 },
                          minWidth: { sm: 120 },
                        }}
                      />
                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          const selectedCardData = filteredCards.filter(card =>
                            selectedCards.includes(card.id),
                          );
                          startMobileListingFlow(
                            selectedCardData,
                            bulkPrice || '1.00',
                          );
                        }}
                        disabled={!bulkPrice || parseFloat(bulkPrice) <= 0}
                        size={isMobile ? 'medium' : 'small'}
                        sx={{
                          minWidth: isMobile ? '100%' : { sm: 160 },
                          py: isMobile ? 1 : { sm: 0.75 },
                        }}
                      >
                        {isMobile
                          ? `List ${selectedCards.length} Cards`
                          : `Bulk List (${selectedCards.length})`}
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Instructions Banner - Mobile Only */}
      {isMobile && showInstructions && (
        <Alert
          severity="info"
          sx={{ mb: { xs: 2, md: 3 } }}
          onClose={() => setShowInstructions(false)}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => setShowInstructions(false)}
            >
              Got it
            </Button>
          }
        >
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>How to create listings:</strong>
          </Typography>
          <Typography variant="body2" component="div">
            1. Select cards using the checkboxes OR tap "List" on individual
            cards
            <br />
            2. Set a bulk price or individual prices
            <br />
            3. Tap "List Cards" or "List" to start the pricing flow
            <br />
            4. Review each card and set final prices
          </Typography>
        </Alert>
      )}

      {/* Error Display */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: { xs: 2, md: 3 } }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Cards Grid */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {loading && cards.length === 0
          ? Array.from({ length: 8 }).map((_, idx) => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={`skeleton-${idx}`}>
                <Card>
                  <Box
                    sx={{
                      p: { xs: 0.5, sm: 1 },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: { xs: 200, sm: 250, md: 300 },
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <Skeleton
                      variant="rectangular"
                      sx={{
                        borderRadius: 2,
                        width: { xs: 120, sm: 160, md: 200 },
                        height: { xs: 160, sm: 220, md: 278 },
                      }}
                    />
                  </Box>
                  <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                    <Skeleton
                      width="80%"
                      sx={{ height: { xs: 20, sm: 24 }, mb: 1 }}
                    />
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Skeleton
                        width={60}
                        sx={{ height: { xs: 20, sm: 24 } }}
                      />
                      <Skeleton
                        width={60}
                        sx={{ height: { xs: 20, sm: 24 } }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Skeleton
                        width="45%"
                        sx={{ height: { xs: 32, sm: 36 } }}
                      />
                      <Skeleton
                        width="45%"
                        sx={{ height: { xs: 32, sm: 36 } }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))
          : filteredCards.map(card => (
              <Grid item xs={6} sm={6} md={4} lg={3} key={card.id}>
                <LazyCardRenderer
                  card={card}
                  isLoaded={isCardLoaded(card.id)}
                  onLoad={() => handleCardLoad(card.id)}
                >
                  <Card sx={{ position: 'relative', height: '100%' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCards.includes(card.id)}
                          onChange={e =>
                            handleCardSelect(card.id, e.target.checked)
                          }
                          size={isSmallMobile ? 'medium' : 'small'}
                        />
                      }
                      label=""
                      sx={{
                        position: 'absolute',
                        top: { xs: 4, sm: 8 },
                        left: { xs: 4, sm: 8 },
                        zIndex: 1,
                        '& .MuiCheckbox-root': {
                          p: { xs: 0.5, sm: 1 },
                        },
                      }}
                    />

                    <Box
                      sx={{
                        p: { xs: 0.5, sm: 1 },
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: { xs: 200, sm: 250, md: 300 },
                        backgroundColor: '#f8f9fa',
                      }}
                    >
                      <CardDisplayWrapper
                        card={card}
                        width={isSmallMobile ? 'constrained' : 'responsive'}
                      />
                    </Box>

                    <CardContent
                      sx={{
                        p: { xs: 1, sm: 2 },
                        '&:last-child': { pb: { xs: 1, sm: 2 } },
                      }}
                    >
                      <Stack spacing={{ xs: 0.5, sm: 1 }}>
                        <Typography
                          variant={isSmallMobile ? 'subtitle2' : 'h6'}
                          noWrap
                          title={card.name}
                          sx={{ fontSize: { xs: '0.9rem', sm: '1.25rem' } }}
                        >
                          {card.name}
                        </Typography>

                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={{ xs: 0.5, sm: 1 }}
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                          <Chip
                            size="small"
                            label={card.type}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                            }}
                          />
                          <Chip
                            size="small"
                            color="default"
                            label="Available"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                            }}
                          />
                          {/* Source indicator to show card origin */}
                          <Chip
                            size="small"
                            color={
                              card.source === 'custom' ? 'secondary' : 'primary'
                            }
                            label={
                              card.source === 'custom' ? 'Creator' : 'Booster'
                            }
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                            }}
                          />
                        </Stack>

                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          spacing={{ xs: 0.5, sm: 1 }}
                          sx={{ mt: { xs: 0.5, sm: 1 } }}
                        >
                          <Button
                            component={Link}
                            href={`/gallery/${card.id}`}
                            variant="outlined"
                            size={isSmallMobile ? 'small' : 'medium'}
                            fullWidth
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            View
                          </Button>

                          <Button
                            variant="contained"
                            size={isSmallMobile ? 'small' : 'medium'}
                            fullWidth
                            onClick={() =>
                              startMobileListingFlow([card], '1.00')
                            }
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                          >
                            List
                          </Button>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </LazyCardRenderer>
              </Grid>
            ))}
      </Grid>

      {/* Pagination */}
      {total > itemsPerPage && (
        <Stack alignItems="center" sx={{ mt: { xs: 3, md: 4 } }}>
          <Pagination
            count={Math.ceil(total / itemsPerPage)}
            page={page}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size={isSmallMobile ? 'medium' : 'large'}
            showFirstButton={!isSmallMobile}
            showLastButton={!isSmallMobile}
            siblingCount={isSmallMobile ? 0 : 1}
            boundaryCount={1}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mt: 1,
              fontSize: { xs: '0.8rem', sm: '0.875rem' },
              textAlign: 'center',
            }}
          >
            Showing {(page - 1) * itemsPerPage + 1} -{' '}
            {Math.min(page * itemsPerPage, total)} of {total} cards
          </Typography>
        </Stack>
      )}

      {/* Empty State */}
      {!loading && filteredCards.length === 0 && (
        <Paper
          sx={{
            p: { xs: 3, sm: 4 },
            textAlign: 'center',
            mx: { xs: 0, sm: 2 },
          }}
        >
          <Typography
            variant={isSmallMobile ? 'subtitle1' : 'h6'}
            color="text.secondary"
            gutterBottom
            sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}
          >
            No cards available to list
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.9rem', sm: '0.875rem' },
            }}
          >
            {searchTerm
              ? 'No cards match your search. Try adjusting your search terms.'
              : 'All your cards are already listed or you need to create some new cards first.'}
          </Typography>
          <Button
            component={Link}
            href="/creator"
            variant="contained"
            size={isSmallMobile ? 'medium' : 'large'}
            sx={{
              fontSize: { xs: '0.9rem', sm: '1rem' },
              px: { xs: 3, sm: 4 },
            }}
          >
            Create New Card
          </Button>
        </Paper>
      )}

      {/* Enhanced Listing Flow - Full Screen */}
      <Dialog
        open={showMobileListingFlow}
        onClose={closeMobileListingFlow}
        fullScreen={true}
        PaperProps={{
          sx: {
            margin: 0,
            borderRadius: 0,
            maxHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            background: theme.palette.background.default,
          },
        }}
      >
        {/* Enhanced Header with Better Visual Hierarchy */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            color: 'white',
            position: 'relative',
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <IconButton
              onClick={closeMobileListingFlow}
              disabled={mobileListingBusy}
              sx={{
                color: 'white',
                backgroundColor: alpha(theme.palette.common.white, 0.1),
                '&:hover': {
                  backgroundColor: alpha(theme.palette.common.white, 0.2),
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <CloseIcon />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  fontSize: { xs: '1.25rem', sm: '1.5rem' },
                  lineHeight: 1.2,
                  mb: 0.5,
                }}
              >
                Price Your Cards
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  fontWeight: 500,
                }}
              >
                {listingSteps.length} card{listingSteps.length !== 1 ? 's' : ''}{' '}
                • Step {currentStepIndex + 1} of {listingSteps.length}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Enhanced Progress Bar */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            pb: { xs: 1, sm: 2 },
            background: theme.palette.background.paper,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Stack spacing={1}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Progress
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontWeight: 600 }}
              >
                {Math.round(
                  ((currentStepIndex + 1) / listingSteps.length) * 100,
                )}
                %
              </Typography>
            </Stack>
            <MobileStepper
              variant="progress"
              steps={listingSteps.length}
              position="static"
              activeStep={currentStepIndex}
              sx={{
                background: 'transparent',
                '& .MuiLinearProgress-root': {
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: alpha(theme.palette.primary.main, 0.12),
                },
                '& .MuiLinearProgress-bar': {
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                },
              }}
              nextButton={null}
              backButton={null}
            />
          </Stack>
        </Box>

        {/* Enhanced Content with Better Visual Hierarchy */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
          }}
        >
          {listingSteps[currentStepIndex] && (
            <Stack spacing={4}>
              {/* Enhanced Card Display Section */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  p: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08,
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Card Preview
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: { xs: 280, sm: 320 },
                    width: '100%',
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    borderRadius: 2,
                    p: 2,
                    border: `1px solid ${alpha(
                      theme.palette.primary.main,
                      0.1,
                    )}`,
                  }}
                >
                  <CardDisplayWrapper
                    card={listingSteps[currentStepIndex].card}
                    width="constrained"
                  />
                </Box>
              </Box>

              {/* Enhanced Card Info Section */}
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08,
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Card Details
                </Typography>
                <Stack spacing={2}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                      fontSize: { xs: '1.25rem', sm: '1.5rem' },
                      lineHeight: 1.2,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {listingSteps[currentStepIndex].card.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                    <Chip
                      size="medium"
                      label={listingSteps[currentStepIndex].card.type}
                      color="primary"
                      variant="filled"
                      sx={{ fontWeight: 600 }}
                    />
                    <Chip
                      size="medium"
                      label={
                        listingSteps[currentStepIndex].card.rarity || 'Common'
                      }
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Stack>
                </Stack>
              </Box>

              {/* Enhanced Pricing Section */}
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08,
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Pricing
                </Typography>
                <Stack spacing={3}>
                  <Stack spacing={2}>
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      Set your price
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ lineHeight: 1.5 }}
                    >
                      Choose a competitive price that reflects your card's value
                      and rarity
                    </Typography>
                  </Stack>

                  <TextField
                    fullWidth
                    label="Price (Credits)"
                    type="number"
                    value={listingSteps[currentStepIndex].price}
                    onChange={e =>
                      updateStepPrice(currentStepIndex, e.target.value)
                    }
                    placeholder="e.g. 500"
                    helperText="Enter the price in credits you want to sell this card for"
                    size="medium"
                    InputProps={{
                      startAdornment: (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mr: 1,
                            color: 'text.secondary',
                          }}
                        >
                          <CreditIcon />
                        </Box>
                      ),
                    }}
                    sx={{
                      '& .MuiInputBase-root': {
                        fontSize: '1.125rem',
                        py: 1.5,
                        px: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.02,
                        ),
                        border: `1px solid ${alpha(
                          theme.palette.primary.main,
                          0.1,
                        )}`,
                        '&:hover': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.04,
                          ),
                          borderColor: alpha(theme.palette.primary.main, 0.2),
                        },
                        '&.Mui-focused': {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.06,
                          ),
                          borderColor: theme.palette.primary.main,
                          boxShadow: `0 0 0 3px ${alpha(
                            theme.palette.primary.main,
                            0.1,
                          )}`,
                        },
                      },
                      '& .MuiInputLabel-root': {
                        fontWeight: 500,
                      },
                    }}
                  />
                </Stack>
              </Box>

              {/* Enhanced Quick Price Suggestions */}
              <Box
                sx={{
                  p: { xs: 2, sm: 3 },
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 3,
                  boxShadow: `0 2px 12px ${alpha(
                    theme.palette.common.black,
                    0.08,
                  )}`,
                  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    fontWeight: 600,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                  }}
                >
                  Quick Options
                </Typography>
                <Stack spacing={2}>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontWeight: 500 }}
                  >
                    Popular price points:
                  </Typography>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    sx={{ flexWrap: 'wrap' }}
                  >
                    {['100', '500', '1000', '2000'].map(price => (
                      <Chip
                        key={price}
                        label={`${price} credits`}
                        onClick={() => updateStepPrice(currentStepIndex, price)}
                        variant={
                          listingSteps[currentStepIndex].price === price
                            ? 'filled'
                            : 'outlined'
                        }
                        color={
                          listingSteps[currentStepIndex].price === price
                            ? 'primary'
                            : 'default'
                        }
                        sx={{
                          mb: 1,
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          py: 1,
                          px: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                            boxShadow: `0 4px 12px ${alpha(
                              theme.palette.primary.main,
                              0.2,
                            )}`,
                          },
                        }}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          )}
        </Box>

        {/* Enhanced Navigation */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
            background: theme.palette.background.paper,
            boxShadow: `0 -4px 20px ${alpha(theme.palette.common.black, 0.08)}`,
          }}
        >
          <Stack spacing={2}>
            {/* Step Indicator */}
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                {currentStepIndex + 1} of {listingSteps.length} cards
              </Typography>
              {currentStepIndex < listingSteps.length - 1 && (
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  {listingSteps.length - currentStepIndex - 1} remaining
                </Typography>
              )}
            </Stack>

            {/* Navigation Buttons */}
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                onClick={goToPreviousStep}
                disabled={currentStepIndex === 0 || mobileListingBusy}
                startIcon={<ArrowBackIcon />}
                sx={{
                  flex: 1,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  borderWidth: 2,
                  '&:hover': {
                    borderWidth: 2,
                  },
                }}
              >
                Previous
              </Button>

              {currentStepIndex < listingSteps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={goToNextStep}
                  disabled={
                    !listingSteps[currentStepIndex]?.isValid ||
                    mobileListingBusy
                  }
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(
                      theme.palette.primary.main,
                      0.3,
                    )}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(
                        theme.palette.primary.main,
                        0.4,
                      )}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleMobileListingCreate}
                  disabled={
                    !listingSteps.every(step => step.isValid) ||
                    mobileListingBusy
                  }
                  sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                    boxShadow: `0 4px 16px ${alpha(
                      theme.palette.success.main,
                      0.3,
                    )}`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`,
                      boxShadow: `0 6px 20px ${alpha(
                        theme.palette.success.main,
                        0.4,
                      )}`,
                      transform: 'translateY(-1px)',
                    },
                    '&:disabled': {
                      background: theme.palette.action.disabledBackground,
                      boxShadow: 'none',
                      transform: 'none',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {mobileListingBusy ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          border: `2px solid ${alpha(
                            theme.palette.common.white,
                            0.3,
                          )}`,
                          borderTop: `2px solid ${theme.palette.common.white}`,
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite',
                          '@keyframes spin': {
                            '0%': { transform: 'rotate(0deg)' },
                            '100%': { transform: 'rotate(360deg)' },
                          },
                        }}
                      />
                      <span>Creating...</span>
                    </Stack>
                  ) : (
                    `Create ${listingSteps.length} Listings`
                  )}
                </Button>
              )}
            </Stack>
          </Stack>
        </Box>
      </Dialog>
    </Container>
  );
}

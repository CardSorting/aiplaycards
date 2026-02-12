'use client';

import { useEffect, useState } from 'react';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Fade,
  Grid,
  IconButton,
  Link as MUILink,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Zoom,
  useMediaQuery,
} from '@mui/material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ViewGridIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import SortIcon from '@mui/icons-material/Sort';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  CardData,
  LazyCardRenderer,
  MTGCardDisplayWrapper,
  normalizeCardData,
  useCardLoadingState,
} from '@components/CardDisplayWrapper';

interface SpellListing extends CardData {
  id: number; // listing ID
  priceCredits: number;
  sellerUserId: string;
  sellerUsername?: string;
  createdAt: string;
}

export default function SpellMarketplacePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const isMobile = useMediaQuery('(max-width:960px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // Card listings state
  const [listings, setListings] = useState<SpellListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Use the card loading hook
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  // Search and filtering state
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc'>('new');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [debouncedMin, setDebouncedMin] = useState<number | undefined>(
    undefined,
  );
  const [debouncedMax, setDebouncedMax] = useState<number | undefined>(
    undefined,
  );

  // UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favoriteListings, setFavoriteListings] = useState<Set<number>>(
    new Set(),
  );

  // Spell-specific card types
  const cardTypes = [
    'Artifact',
    'Creature',
    'Enchantment',
    'Instant',
    'Land',
    'Planeswalker',
    'Sorcery',
    'Tribal',
  ];
  const sortOptions = [
    { value: 'new', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
  ];

  const filteredListings = (items: SpellListing[]) => {
    const typeFiltered =
      selectedTypes.length > 0
        ? items.filter(i => selectedTypes.includes(i.type))
        : items;
    return typeFiltered;
  };

  const toggleFavorite = (listingId: number) => {
    setFavoriteListings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(listingId)) {
        newSet.delete(listingId);
      } else {
        newSet.add(listingId);
      }
      return newSet;
    });
  };

  const activeFiltersCount =
    selectedTypes.length +
    (debouncedMin ? 1 : 0) +
    (debouncedMax ? 1 : 0) +
    (search.trim() ? 1 : 0);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedTypes([]);
    setMinPrice('');
    setMaxPrice('');
  };

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const params = new URLSearchParams({
          limit: '30',
          offset: String((page - 1) * 30),
          category: 'spell',
        });
        if (debouncedMin != null) params.set('minPrice', String(debouncedMin));
        if (debouncedMax != null) params.set('maxPrice', String(debouncedMax));
        if (search.trim()) params.set('search', search.trim());
        if (sort) params.set('sort', sort);

        const res = await fetch(`/api/marketplace?${params.toString()}`);
        if (!res.ok) {
          console.error(
            'Spell marketplace API error:',
            res.status,
            res.statusText,
          );
          return;
        }
        const data = await res.json();
        if (!active) return;

        const normalizedListings: SpellListing[] = Array.isArray(data?.data)
          ? data.data.map((listing: any) => ({
              ...normalizeCardData(listing),
              id: listing.id,
              priceCredits: listing.priceCredits,
              sellerUserId: listing.sellerUserId,
              sellerUsername: listing.sellerUsername,
              createdAt: listing.createdAt,
            }))
          : [];

        setTotal(Number(data?.total || 0));
        setListings(normalizedListings);
      } catch (error) {
        console.error('Error fetching spell marketplace data:', error);
        if (active) setListings([]);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [search, sort, page, debouncedMin, debouncedMax]);

  // Reset pagination when filters change
  useEffect(() => {
    setPage(1);
  }, [search, sort, debouncedMin, debouncedMax]);

  // Debounce price inputs
  useEffect(() => {
    const t = setTimeout(() => {
      const val = parseInt(minPrice, 10);
      setDebouncedMin(Number.isFinite(val) && val >= 0 ? val : undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [minPrice]);

  useEffect(() => {
    const t = setTimeout(() => {
      const val = parseInt(maxPrice, 10);
      setDebouncedMax(Number.isFinite(val) && val >= 0 ? val : undefined);
    }, 300);
    return () => clearTimeout(t);
  }, [maxPrice]);

  return (
    <Container
      maxWidth="xl"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      {/* Header Section */}
      <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MUILink component={Link} href="/">
            Home
          </MUILink>
          <MUILink component={Link} href="/marketplace">
            Marketplace
          </MUILink>
          <Typography color="text.primary">Spell Cards</Typography>
        </Breadcrumbs>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          gap={2}
        >
          <Box>
            <Typography
              variant={isSmallMobile ? 'h4' : 'h3'}
              fontWeight={700}
              sx={{ mb: 1 }}
            >
              Spell Marketplace
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              Discover powerful spells, creatures, and artifacts from the
              community
            </Typography>
          </Box>

          {/* Desktop View Toggle */}
          {!isMobile && (
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewGridIcon fontSize="small" />
              </ToggleButton>
              <ToggleButton value="list" aria-label="list view">
                <ViewListIcon fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>
          )}
        </Stack>

        {/* Search and Quick Actions Bar */}
        <Paper elevation={1} sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={{ xs: 1.5, md: 2 }}
            alignItems={{ xs: 'stretch', md: 'center' }}
          >
            {/* Search */}
            <Box
              sx={{
                position: 'relative',
                flex: 1,
                maxWidth: { xs: '100%', md: 400 },
              }}
            >
              <TextField
                fullWidth
                size={isSmallMobile ? 'medium' : 'small'}
                placeholder="Search spell cards..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                  endAdornment: search && (
                    <IconButton
                      size={isSmallMobile ? 'medium' : 'small'}
                      onClick={() => setSearch('')}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
              />
            </Box>

            {/* Sort and Filter Row */}
            <Stack
              direction="row"
              spacing={1}
              sx={{ width: { xs: '100%', md: 'auto' } }}
            >
              <TextField
                select
                size={isSmallMobile ? 'medium' : 'small'}
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                sx={{
                  minWidth: { xs: 140, sm: 180 },
                  flex: { xs: 1, md: 'none' },
                }}
                InputProps={{
                  startAdornment: (
                    <SortIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  ),
                }}
              >
                {sortOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            {/* Results Count */}
            {!loading && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                {total} {total === 1 ? 'card' : 'cards'} found
              </Typography>
            )}
          </Stack>
        </Paper>
      </Stack>

      {/* Main Content */}
      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {/* Top Pagination */}
        {total > 0 && (
          <Grid item xs={12}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'center', sm: 'center' }}
              spacing={{ xs: 1, sm: 0 }}
              sx={{ mb: { xs: 2, md: 3 } }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                  textAlign: 'center',
                }}
              >
                Showing {Math.min((page - 1) * 30 + 1, total)} -{' '}
                {Math.min(page * 30, total)} of {total} results
              </Typography>
              <Pagination
                count={Math.ceil(total / 30)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                size={isSmallMobile ? 'small' : 'medium'}
                showFirstButton={!isSmallMobile}
                showLastButton={!isSmallMobile}
                siblingCount={isSmallMobile ? 0 : 1}
                boundaryCount={1}
              />
            </Stack>
          </Grid>
        )}

        {/* Product Grid */}
        {loading ? (
          // Loading Skeletons
          Array.from({ length: 8 }).map((_, idx) => (
            <Grid
              item
              xs={6}
              sm={6}
              md={viewMode === 'list' ? 12 : 4}
              lg={viewMode === 'list' ? 12 : 3}
              key={`skeleton-${idx}`}
            >
              <Card elevation={2}>
                <Box
                  sx={{
                    p: { xs: 1, sm: 2 },
                    bgcolor: '#f8f9fa',
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      borderRadius: 2,
                      width: { xs: 120, sm: 180, md: 240 },
                      height: { xs: 160, sm: 240, md: 320 },
                    }}
                  />
                </Box>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Stack spacing={1}>
                    <Skeleton width="80%" sx={{ height: { xs: 20, sm: 28 } }} />
                    <Skeleton width="60%" sx={{ height: { xs: 18, sm: 24 } }} />
                    <Skeleton width="40%" sx={{ height: { xs: 16, sm: 20 } }} />
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : filteredListings(listings).length === 0 ? (
          // No Results
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}
            >
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                No spell cards found
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Try adjusting your filters or search terms
              </Typography>
              {activeFiltersCount > 0 && (
                <Button variant="outlined" onClick={clearAllFilters}>
                  Clear All Filters
                </Button>
              )}
            </Paper>
          </Grid>
        ) : (
          // Product Cards
          filteredListings(listings).map(listing => (
            <Grid
              item
              xs={6}
              sm={6}
              md={viewMode === 'list' ? 12 : 4}
              lg={viewMode === 'list' ? 12 : 3}
              key={listing.id}
            >
              <Fade in timeout={300}>
                <Card
                  elevation={2}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection:
                      viewMode === 'list' && !isMobile ? 'row' : 'column',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform:
                        viewMode === 'grid' && !isMobile
                          ? 'translateY(-8px)'
                          : isMobile
                          ? 'translateY(-4px)'
                          : 'none',
                      boxShadow: theme => theme.shadows[12],
                      '& .cardImage': {
                        transform: isMobile ? 'scale(1.02)' : 'scale(1.05)',
                      },
                      '& .priceTag': {
                        transform: 'scale(1.1)',
                      },
                      '& .favoriteBtn': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => router.push(`/marketplace/${listing.id}`)}
                >
                  {/* Card Image Section */}
                  <Box
                    sx={{
                      position: 'relative',
                      bgcolor: '#f8f9fa',
                      p: {
                        xs: 1,
                        sm: viewMode === 'list' && !isMobile ? 1 : 2,
                      },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: {
                        xs: 160,
                        sm: viewMode === 'list' && !isMobile ? 120 : 200,
                        md: viewMode === 'list' ? 120 : 280,
                      },
                      width: viewMode === 'list' && !isMobile ? 160 : '100%',
                      overflow: 'hidden',
                    }}
                  >
                    <LazyCardRenderer
                      card={listing}
                      isLoaded={isCardLoaded(listing.id)}
                      onLoad={() => handleCardLoad(listing.id)}
                    >
                      <Box
                        className="cardImage"
                        sx={{
                          transition: 'transform 0.3s ease',
                          width: {
                            xs: 80,
                            sm: viewMode === 'list' && !isMobile ? 100 : 140,
                            md: viewMode === 'list' ? 100 : 240,
                          },
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        <MTGCardDisplayWrapper
                          card={listing}
                          width="responsive"
                        />
                      </Box>
                    </LazyCardRenderer>

                    {/* Price Tag */}
                    <Zoom in timeout={500}>
                      <Box
                        className="priceTag"
                        sx={{
                          position: 'absolute',
                          top: { xs: 8, sm: 12 },
                          left: { xs: 8, sm: 12 },
                          bgcolor: 'success.main',
                          color: 'white',
                          px: { xs: 1, sm: 1.5 },
                          py: { xs: 0.25, sm: 0.5 },
                          borderRadius: 2,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          fontWeight: 700,
                          boxShadow: 2,
                          transition: 'transform 0.2s ease',
                        }}
                      >
                        {listing.priceCredits} credits
                      </Box>
                    </Zoom>

                    {/* Favorite Button */}
                    <IconButton
                      className="favoriteBtn"
                      size={isSmallMobile ? 'medium' : 'small'}
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(listing.id);
                      }}
                      sx={{
                        position: 'absolute',
                        top: { xs: 8, sm: 12 },
                        right: { xs: 8, sm: 12 },
                        bgcolor: 'rgba(255, 255, 255, 0.9)',
                        opacity: { xs: 1, sm: 0 },
                        transition: 'opacity 0.2s ease',
                        minWidth: { xs: 36, sm: 'auto' },
                        minHeight: { xs: 36, sm: 'auto' },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 1)',
                          transform: 'scale(1.1)',
                        },
                      }}
                    >
                      {favoriteListings.has(listing.id) ? (
                        <FavoriteIcon
                          color="error"
                          fontSize={isSmallMobile ? 'medium' : 'small'}
                        />
                      ) : (
                        <FavoriteBorderIcon
                          fontSize={isSmallMobile ? 'medium' : 'small'}
                        />
                      )}
                    </IconButton>
                  </Box>

                  {/* Card Details */}
                  <CardContent
                    sx={{
                      flex: 1,
                      p: { xs: 1, sm: 1.5, md: 2 },
                      '&:last-child': { pb: { xs: 1, sm: 1.5, md: 2 } },
                    }}
                  >
                    <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ height: '100%' }}>
                      {/* Card Name */}
                      <Typography
                        variant={isSmallMobile ? 'subtitle2' : 'h6'}
                        fontWeight={600}
                        sx={{
                          lineHeight: 1.2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: { xs: 1, sm: 2 },
                          WebkitBoxOrient: 'vertical',
                          fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                        }}
                      >
                        {listing.name}
                      </Typography>

                      {/* Card Type and Price */}
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        spacing={{ xs: 0.5, sm: 0 }}
                      >
                        <Chip
                          size="small"
                          label={listing.type}
                          variant="outlined"
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 32 },
                          }}
                        />
                        <Typography
                          variant={isSmallMobile ? 'subtitle1' : 'h6'}
                          fontWeight={700}
                          color="success.main"
                          sx={{
                            fontSize: {
                              xs: '0.9rem',
                              sm: '1rem',
                              md: '1.1rem',
                            },
                          }}
                        >
                          {listing.priceCredits} credits
                        </Typography>
                      </Stack>

                      {/* Action Area */}
                      <Box sx={{ mt: 'auto', pt: { xs: 0.5, sm: 1 } }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Button
                            variant="contained"
                            size={isSmallMobile ? 'small' : 'medium'}
                            startIcon={!isSmallMobile && <ShoppingCartIcon />}
                            sx={{
                              flex: 1,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              py: { xs: 0.5, sm: 0.75 },
                            }}
                            onClick={e => {
                              e.stopPropagation();
                              router.push(`/marketplace/${listing.id}`);
                            }}
                          >
                            {isSmallMobile ? 'View' : 'View Details'}
                          </Button>
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))
        )}

        {/* Bottom Pagination */}
        {total > 0 && (
          <Grid item xs={12}>
            <Stack alignItems="center" sx={{ mt: { xs: 3, md: 4 } }}>
              <Pagination
                count={Math.ceil(total / 30)}
                page={page}
                onChange={(_, p) => setPage(p)}
                color="primary"
                size={isSmallMobile ? 'medium' : 'large'}
                showFirstButton={!isSmallMobile}
                showLastButton={!isSmallMobile}
                siblingCount={isSmallMobile ? 0 : 2}
                boundaryCount={1}
              />
            </Stack>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}

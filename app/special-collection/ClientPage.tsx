'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Fade,
  Grid,
  IconButton,
  Pagination,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { Share as ShareIcon, Style as StyleIcon } from '@mui/icons-material';
import { SEO } from '@layout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  SpecialCollectionControls,
  SpecialCollectionFilters,
  SpecialCollectionHeader,
} from './components';

interface ClaimedCard {
  id: number;
  cardName: string;
  imageUrl: string;
  rarity: string;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  claimedAt: string;
  originalSlotNumber: number;
}

interface CollectionStats {
  totalCards: number;
  totalPacks: number;
  categoriesCount: number;
  recentClaimsCount: number;
}

// Special collection card component
const SpecialCollectionCardComponent = ({
  card,
  onShare,
}: {
  card: ClaimedCard;
  onShare: (card: ClaimedCard) => void;
}) => {
  const getCategoryColor = (color: string | null | undefined) => {
    return color || '#1976d2';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return '#9e9e9e';
      case 'uncommon':
        return '#4caf50';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#1976d2';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          backgroundColor: '#f8f9fa',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <img
          src={card.imageUrl}
          alt={card.cardName}
          style={{
            width: '100%',
            height: '140px',
            objectFit: 'cover',
            borderRadius: '4px',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {card.cardName}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip
            label={card.rarity}
            size="small"
            sx={{
              backgroundColor: getRarityColor(card.rarity),
              color: 'white',
              fontWeight: 'bold',
            }}
          />
          {card.categoryName && (
            <Chip
              label={card.categoryName}
              size="small"
              sx={{
                backgroundColor: getCategoryColor(card.categoryColor),
                color: 'white',
              }}
            />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Claimed {formatDate(card.claimedAt)}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'center', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title="View Card">
            <IconButton
              size="small"
              component={Link}
              href={`/special-collection/card/${card.id}`}
            >
              <StyleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share Card">
            <IconButton size="small" onClick={() => onShare(card)}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </CardActions>
    </Card>
  );
};

const SpecialCollectionClientPage: FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [allCards, setAllCards] = useState<ClaimedCard[]>([]);
  const [stats, setStats] = useState<CollectionStats>({
    totalCards: 0,
    totalPacks: 0,
    categoriesCount: 0,
    recentClaimsCount: 0,
  });
  const [statsLoading, setStatsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'rarity' | 'category'>(
    'date',
  );
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle URL parameters for ATC tab
  const activeTab = searchParams.get('tab');
  const highlightId = searchParams.get('highlight');

  const fetchSpecialCollection = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const cacheBuster = Date.now();
      const response = await fetch(
        `/api/special-collection?_t=${cacheBuster}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Failed to fetch special collection: HTTP',
          response.status,
          response.statusText,
        );
        console.error('Response body:', errorText);
        throw new Error(
          `Failed to fetch special collection: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      const collection = Array.isArray(data.collection) ? data.collection : [];

      // Extract all cards from packs
      const allCards = collection.flatMap((pack: any) => pack.cards || []);
      setAllCards(allCards);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to load special collection';
      setError(errorMessage);
      console.error('Special collection fetch error:', err);
    } finally {
      setLoading(false);
      if (initialRender) {
        setInitialRender(false);
      }
    }
  }, [user, initialRender]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/special-collection/stats');

      if (!response.ok) {
        console.error(
          'Failed to load stats: HTTP',
          response.status,
          response.statusText,
        );
        return;
      }

      const data = await response.json();

      if (data.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
      // Don't update stats on error, keep the default values
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // Filter, sort, and paginate cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        card =>
          card.cardName?.toLowerCase().includes(query) ||
          card.rarity?.toLowerCase().includes(query) ||
          card.categoryName?.toLowerCase().includes(query),
      );
    }

    // Apply rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === filterRarity);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(card => card.categoryName === filterCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'name':
          compareResult = (a.cardName || '').localeCompare(b.cardName || '');
          break;
        case 'date':
          compareResult =
            new Date(a.claimedAt).getTime() - new Date(b.claimedAt).getTime();
          break;
        case 'rarity':
          const rarityOrder = {
            legendary: 5,
            epic: 4,
            rare: 3,
            uncommon: 2,
            common: 1,
          };
          const aRarity =
            rarityOrder[a.rarity.toLowerCase() as keyof typeof rarityOrder] ||
            0;
          const bRarity =
            rarityOrder[b.rarity.toLowerCase() as keyof typeof rarityOrder] ||
            0;
          compareResult = aRarity - bRarity;
          break;
        case 'category':
          compareResult = (a.categoryName || '').localeCompare(
            b.categoryName || '',
          );
          break;
      }

      return sortOrder === 'desc' ? -compareResult : compareResult;
    });

    return filtered;
  }, [allCards, searchQuery, filterRarity, filterCategory, sortBy, sortOrder]);

  // Paginate the filtered results
  const paginatedCards = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedCards.slice(start, end);
  }, [filteredAndSortedCards, page]);

  // Update cards and total when filtered results change
  useEffect(() => {
    setTotal(filteredAndSortedCards.length);
    if (
      page > 1 &&
      paginatedCards.length === 0 &&
      filteredAndSortedCards.length > 0
    ) {
      setPage(1);
    }
  }, [paginatedCards, filteredAndSortedCards.length, page]);

  // Get unique values for filter options
  const uniqueRarities = useMemo(
    () =>
      [
        ...new Set(
          allCards
            .map(card => card.rarity)
            .filter((rarity): rarity is string => Boolean(rarity)),
        ),
      ].sort(),
    [allCards],
  );

  const uniqueCategories = useMemo(
    () =>
      [
        ...new Set(
          allCards
            .map(card => card.categoryName)
            .filter((category): category is string => Boolean(category)),
        ),
      ].sort(),
    [allCards],
  );

  useEffect(() => {
    fetchSpecialCollection();
    // Try to fetch stats, but don't block the main functionality if it fails
    fetchStats().catch(err => {
      console.warn('Stats fetch failed, continuing without stats:', err);
    });
  }, [fetchSpecialCollection, fetchStats]);

  // Handle ATC tab parameter
  useEffect(() => {
    if (activeTab === 'atc') {
      setFilterCategory('ATC');
    }
  }, [activeTab]);

  const handleShareCard = (card: ClaimedCard) => {
    if (navigator.share) {
      navigator
        .share({
          title: `Check out my ${card.cardName} special card!`,
          text: `I claimed this ${card.rarity} ${card.cardName} special card!`,
          url: window.location.href,
        })
        .catch(err => {
          console.error('Sharing failed:', err);
          if (navigator.clipboard) {
            navigator.clipboard.writeText(
              `Check out my ${card.cardName} special card!`,
            );
            alert('Card description copied to clipboard!');
          } else {
            alert('Sharing is not supported on this device');
          }
        });
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(
          `Check out my ${card.cardName} special card!`,
        );
        alert('Card description copied to clipboard!');
      } else {
        alert('Sharing is not supported on this device');
      }
    }
  };

  if (!user) {
    return (
      <>
        <SEO
          title="Special Collection - Login Required"
          description="View your exclusive collection of claimed PlayMore packs and premium cards"
        />
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to be logged in to view your special collection.
          </Typography>
          <Button
            component={Link}
            href="/special-packs"
            variant="contained"
            size="large"
          >
            Browse Special Packs
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title="My Special Collection"
        description="Your exclusive collection of claimed PlayMore packs and premium cards"
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <SpecialCollectionHeader
            stats={stats}
            showStats={allCards.length > 0}
            statsLoading={statsLoading}
          />

          {/* ATC Tab Indicator */}
          {activeTab === 'atc' && (
            <Box
              sx={{
                bgcolor: '#10B981',
                color: 'white',
                p: 2,
                borderRadius: 2,
                mt: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              <StyleIcon />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Artist Trading Cards Collection
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Your custom ATC creations
              </Typography>
            </Box>
          )}

          {/* Control Panel */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <SpecialCollectionControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              showViewOptions={false}
              setShowViewOptions={() => {}}
            />

            <SpecialCollectionFilters
              showFilters={showFilters}
              showViewOptions={false}
              filterRarity={filterRarity}
              setFilterRarity={setFilterRarity}
              filterCategory={filterCategory}
              setFilterCategory={setFilterCategory}
              viewMode="cards"
              setViewMode={() => {}}
              uniqueRarities={uniqueRarities}
              uniqueCategories={uniqueCategories}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalResults={filteredAndSortedCards.length}
            />
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading && allCards.length === 0 && (
          <Grid container spacing={3}>
            {Array.from(new Array(8)).map((_, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card>
                  <Box
                    sx={{
                      p: 1,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: 400,
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                  <CardContent>
                    <Box
                      sx={{
                        width: '80%',
                        height: 24,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                      }}
                    />
                    <Box
                      sx={{
                        width: '60%',
                        height: 20,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 1,
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !error && allCards.length === 0 && (
          <Fade in={true}>
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 4, md: 6 },
                borderStyle: 'dashed',
                borderColor: 'divider',
                bgcolor: theme =>
                  theme.palette.mode === 'dark'
                    ? 'background.default'
                    : 'grey.50',
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Start Your Special Collection
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
              >
                Claim your first PlayMore pack to begin building your exclusive
                collection.
              </Typography>
              <Button
                component={Link}
                href="/special-packs"
                variant="contained"
                size="large"
              >
                Browse Special Packs
              </Button>
            </Paper>
          </Fade>
        )}

        {allCards.length > 0 && (
          <>
            <Grid container spacing={3}>
              {paginatedCards.map(card => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                  <SpecialCollectionCardComponent
                    card={card}
                    onShare={handleShareCard}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {total > itemsPerPage && (
              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Pagination
                  count={Math.ceil(total / itemsPerPage)}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Showing {(page - 1) * itemsPerPage + 1} -{' '}
                  {Math.min(page * itemsPerPage, total)} of {total} cards
                </Typography>
              </Stack>
            )}
          </>
        )}

        {!loading &&
          allCards.length > 0 &&
          filteredAndSortedCards.length === 0 && (
            <Fade in={true}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No cards match your filters
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterRarity('all');
                    setFilterCategory('all');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Fade>
          )}

        {/* Footer Actions */}
        {allCards.length > 0 && (
          <Box textAlign="center" sx={{ pt: 4 }}>
            <Button
              variant="outlined"
              onClick={() => router.push('/special-packs')}
              size="large"
              sx={{ mr: 2 }}
            >
              Browse More Packs
            </Button>
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              size="large"
            >
              Refresh Collection
            </Button>
          </Box>
        )}
      </Container>
    </>
  );
};

export default SpecialCollectionClientPage;

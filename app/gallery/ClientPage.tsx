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
import {
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { SEO } from '@layout';
import Link from 'next/link';
import OpenPackButton from '../../src/components/OpenPackButton';
import BoosterCardBackSkeleton from '../../src/components/BoosterCardBack/Skeleton';
import Routes from '@routes';
import {
  CardData,
  CardDisplayWrapper,
  LazyCardRenderer,
  normalizeCardData,
  useCardLoadingState,
  usePagination,
} from '@components/CardDisplayWrapper';
import { useRouter } from 'next/navigation';
import { GalleryControls, GalleryFilters, GalleryHeader } from './components';

interface UserCard extends CardData {
  isPublic: boolean;
  createdAt: string;
  likes?: number;
}

// Gallery card component using the new CardDisplayWrapper
const GalleryCardComponent = ({
  card,
  onShare,
}: {
  card: UserCard;
  onShare: (card: UserCard) => void;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Load initial likes state
  useEffect(() => {
    if (user?.id) {
      // Load likes count and user's like status
      fetch(`/api/cards/${card.id}/likes`)
        .then(res => res.json())
        .then(data => {
          setLikesCount(data.count || 0);
          setIsLiked(data.isLiked || false);
        })
        .catch(err => console.error('Failed to load likes:', err));
    }
  }, [card.id, user?.id]);

  const handleLike = async () => {
    if (!user?.id) return;

    try {
      const res = await fetch(`/api/cards/${card.id}/likes`, {
        method: isLiked ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        setIsLiked(!isLiked);
        setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
      }
    } catch (err) {
      console.error('Failed to update like:', err);
    }
  };

  const handleCardClick = () => {
    router.push(`/gallery/${card.id}`);
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
          cursor: 'pointer',
        }}
        onClick={handleCardClick}
      >
        <CardDisplayWrapper
          card={card}
          width="responsive"
          showFrame={true}
          disableParallax={true}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {card.name}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={card.type} size="small" />
          {card.rarity && (
            <Chip label={card.rarity} size="small" variant="outlined" />
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Created {new Date(card.createdAt).toLocaleDateString()}
        </Typography>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Stack direction="row" spacing={1}>
          <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
            <IconButton
              size="small"
              onClick={handleLike}
              color={isLiked ? 'error' : 'default'}
              disabled={!user?.id}
            >
              {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
            </IconButton>
          </Tooltip>
          <Typography variant="caption" sx={{ alignSelf: 'center' }}>
            {likesCount}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1}>
          <Tooltip title="View Details">
            <IconButton size="small" onClick={handleCardClick}>
              <VisibilityIcon />
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

const ClientGalleryPage: FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [cards, setCards] = useState<UserCard[]>([]);
  const [allCards, setAllCards] = useState<UserCard[]>([]); // Store all cards for client-side filtering
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);
  const [isClient, setIsClient] = useState(false);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'likes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  // Use the new hooks from CardDisplayWrapper
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();
  const { page, setPage, total, setTotal, itemsPerPage, offset } =
    usePagination(20);

  const fetchUserCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      // Fetch all cards at once for better client-side filtering
      // Add cache-busting parameter to ensure fresh data after pack openings
      const cacheBuster = Date.now();
      const response = await fetch(
        `/api/cards?userId=${user.id}&isPublic=true&limit=1000&view=summary&_t=${cacheBuster}`,
        {
          cache: 'no-store',
        },
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();

      // Normalize card data
      const normalizedCards = Array.isArray(data.data)
        ? data.data.map((card: any) => ({
            ...normalizeCardData(card),
            isPublic: card.isPublic,
            createdAt: card.createdAt,
            likes: card.likes || 0, // Add likes count for sorting
          }))
        : [];

      setAllCards(normalizedCards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
      if (initialRender) {
        setInitialRender(false);
      }
    }
  }, [user, initialRender]);

  // Filter, sort, and paginate cards
  const filteredAndSortedCards = useMemo(() => {
    let filtered = allCards;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        card =>
          card.name?.toLowerCase().includes(query) ||
          card.type?.toLowerCase().includes(query) ||
          card.rarity?.toLowerCase().includes(query),
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(card => card.type === filterType);
    }

    // Apply rarity filter
    if (filterRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === filterRarity);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'name':
          compareResult = (a.name || '').localeCompare(b.name || '');
          break;
        case 'date':
          compareResult =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case 'likes':
          compareResult = (a.likes || 0) - (b.likes || 0);
          break;
      }

      return sortOrder === 'desc' ? -compareResult : compareResult;
    });

    return filtered;
  }, [allCards, searchQuery, filterType, filterRarity, sortBy, sortOrder]);

  // Paginate the filtered results
  const paginatedCards = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedCards.slice(start, end);
  }, [filteredAndSortedCards, page, itemsPerPage]);

  // Update cards and total when filtered results change
  useEffect(() => {
    setCards(paginatedCards);
    setTotal(filteredAndSortedCards.length);
    // Reset to first page when filters change
    if (
      page > 1 &&
      paginatedCards.length === 0 &&
      filteredAndSortedCards.length > 0
    ) {
      setPage(1);
    }
  }, [paginatedCards, filteredAndSortedCards.length, page, setPage]);

  // Get unique values for filter options
  const uniqueTypes = useMemo(
    () =>
      [
        ...new Set(
          allCards
            .map(card => card.type)
            .filter((type): type is string => Boolean(type)),
        ),
      ].sort(),
    [allCards],
  );

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

  // Collection stats
  const stats = useMemo(() => {
    const thisMonth = allCards.filter(card => {
      const cardDate = new Date(card.createdAt);
      const now = new Date();
      return (
        cardDate.getMonth() === now.getMonth() &&
        cardDate.getFullYear() === now.getFullYear()
      );
    }).length;

    const mostLikedCard = allCards.reduce(
      (max, card) => ((card.likes || 0) > (max.likes || 0) ? card : max),
      allCards[0] || { likes: 0, name: 'None' },
    );

    return {
      total: allCards.length,
      thisMonth,
      mostLiked: mostLikedCard.name || 'None',
    };
  }, [allCards]);

  useEffect(() => {
    setIsClient(true);
    fetchUserCards();
  }, [fetchUserCards]);

  // Refresh cards when user returns to the page (e.g., after opening a pack)
  useEffect(() => {
    const handleFocus = () => {
      // Refresh cards when the page gains focus
      fetchUserCards();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchUserCards]);

  const handleShareCard = (card: UserCard) => {
    const anyCard: any = card as any;
    const primaryImage =
      (anyCard.primaryImage as string | undefined) ||
      card.imageData?.dataUrl ||
      (Array.isArray(card.imageData?.generated) &&
        card.imageData!.generated![0]);

    if (navigator.share && primaryImage) {
      fetch(primaryImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${card.name || 'Card'}.png`, {
            type: 'image/png',
          });
          navigator.share({
            title: `Check out my ${card.name} card!`,
            text: `I created this ${card.name} tradingcard using PlayMore TCG`,
            files: [file],
          });
        })
        .catch(err => {
          console.error('Sharing failed:', err);
          alert('Sharing is not supported on this device');
        });
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(
          `Check out my ${card.name} trading card created with PlayMore TCG!`,
        );
        alert('Card description copied to clipboard!');
      } else {
        alert('Sharing is not supported on this device');
      }
    }
  };

  const totalPublic = filteredAndSortedCards.length;

  if (!user) {
    return (
      <>
        <SEO
          title="My Colelction - Login Required"
          description="View and manage your trading card collection"
        />
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to be logged in to view your card collection.
          </Typography>
          <Button
            component={Link}
            href={Routes.Creator}
            variant="contained"
            size="large"
          >
            Go to Creator
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title="My Gallery"
        description="View and manage your trading card collection with proper card frames and styling"
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <GalleryHeader stats={stats} showStats={allCards.length > 0} />

          {/* Control Panel */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <GalleryControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              showFilters={showFilters}
              setShowFilters={setShowFilters}
              showEditMenu={showEditMenu}
              setShowEditMenu={setShowEditMenu}
            />

            <GalleryFilters
              showFilters={showFilters}
              showEditMenu={showEditMenu}
              filterType={filterType}
              setFilterType={setFilterType}
              filterRarity={filterRarity}
              setFilterRarity={setFilterRarity}
              uniqueTypes={uniqueTypes}
              uniqueRarities={uniqueRarities}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalPublic={totalPublic}
            />
          </Paper>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {loading && cards.length === 0 && (
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
                      minHeight: 300,
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <Box
                      component="div"
                      sx={{
                        width: 200,
                        height: 278,
                        borderRadius: 2,
                        backgroundColor: '#e0e0e0',
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                  </Box>
                  <CardContent>
                    <Box
                      sx={{
                        width: '80%',
                        height: 24,
                        backgroundColor: '#e0e0e0',
                        borderRadius: 1,
                        mb: 1,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }}
                    />
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                      <Box
                        sx={{
                          width: 60,
                          height: 24,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                      <Box
                        sx={{
                          width: 60,
                          height: 24,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </Stack>
                    <Stack direction="row" spacing={1}>
                      <Box
                        sx={{
                          width: '45%',
                          height: 36,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                      <Box
                        sx={{
                          width: '45%',
                          height: 36,
                          backgroundColor: '#e0e0e0',
                          borderRadius: 1,
                          animation: 'pulse 1.5s ease-in-out infinite',
                        }}
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {!loading && !error && cards.length === 0 && (
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
              }}
            >
              <Grid
                container
                spacing={4}
                alignItems="center"
                justifyContent="center"
              >
                <Grid item xs={12} md={5}>
                  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <BoosterCardBackSkeleton />
                  </Box>
                </Grid>
                <Grid item xs={12} md={7}>
                  <Box textAlign={{ xs: 'center', md: 'left' }}>
                    <Typography variant="overline" color="text.secondary">
                      Empty gallery
                    </Typography>
                    <Typography variant="h4" component="h2" gutterBottom>
                      Start your collection
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ mb: 3, maxWidth: 700 }}
                    >
                      Open a booster pack to reveal a set of randomized cards
                      and begin building your personal gallery.
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 3, flexWrap: 'wrap' }}
                      justifyContent={{ xs: 'center', md: 'flex-start' }}
                    >
                      <Chip
                        label="Randomized pulls"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Collect & share"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label="Fast & fun"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                    <OpenPackButton
                      label="Open a Booster Pack"
                      variant="contained"
                      size="large"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Fade>
        )}

        {cards.length > 0 && (
          <Grid container spacing={3}>
            {cards.map(card => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <LazyCardRenderer
                  card={card}
                  isLoaded={isCardLoaded(card.id)}
                  onLoad={() => handleCardLoad(card.id)}
                  threshold={0.01}
                  rootMargin="300px"
                  skeletonHeight={500}
                >
                  <GalleryCardComponent card={card} onShare={handleShareCard} />
                </LazyCardRenderer>
              </Grid>
            ))}
          </Grid>
        )}

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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Showing {(page - 1) * itemsPerPage + 1} -{' '}
              {Math.min(page * itemsPerPage, total)} of {total} cards
            </Typography>
          </Stack>
        )}

        {!loading &&
          allCards.length > 0 &&
          filteredAndSortedCards.length === 0 && (
            <Fade in={true}>
              <Box textAlign="center" py={8}>
                <Typography variant="h6" gutterBottom color="text.secondary">
                  No cards match your filters
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Try adjusting your search or filter criteria.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterType('all');
                    setFilterRarity('all');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Fade>
          )}

        {!loading && allCards.length === 0 && (
          <Fade in={true}>
            <Box textAlign="center" py={8}>
              <Typography variant="h6" gutterBottom color="text.secondary">
                No cards found
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Create and publish cards to see them here.
              </Typography>
            </Box>
          </Fade>
        )}
      </Container>
    </>
  );
};

export default ClientGalleryPage;

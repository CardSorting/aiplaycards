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
import {
  Download as DownloadIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { SEO } from '@layout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { YugiohCardDisplayWrapper } from '@components/CardDisplayWrapper';
import { YugiohCardData } from '@features/yugiohEditor/types';
import {
  DuelGalleryControls,
  DuelGalleryFilters,
  DuelGalleryHeader,
} from './components';

interface YugiohUserCard {
  id: number;
  cardData: YugiohCardData;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
  likes?: number;
  isPublic: boolean;
}

// Yugioh gallery card component using the YugiohCardDisplayWrapper
const YugiohGalleryCardComponent = ({
  card,
  onShare,
  onDownload,
}: {
  card: YugiohUserCard;
  onShare: (card: YugiohUserCard) => void;
  onDownload: (card: YugiohUserCard) => void;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Load initial likes state
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/yugioh-cards/${card.id}/likes`)
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
      const res = await fetch(`/api/yugioh-cards/${card.id}/likes`, {
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
    router.push(`/duel-gallery/${card.id}`);
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
        <YugiohCardDisplayWrapper
          cardData={card.cardData}
          width={280}
          height={390}
          showFrame={true}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {card.cardData.cardTitle || 'Untitled Card'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={card.cardData.cardType} size="small" />
          {card.cardData.cardSubtype && (
            <Chip
              label={card.cardData.cardSubtype}
              size="small"
              variant="outlined"
            />
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
          <Tooltip title="Download Card">
            <IconButton size="small" onClick={() => onDownload(card)}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
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

const DuelGalleryClientPage: FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [cards, setCards] = useState<YugiohUserCard[]>([]);
  const [allCards, setAllCards] = useState<YugiohUserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'likes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showEditMenu, setShowEditMenu] = useState(false);

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchYugiohCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const cacheBuster = Date.now();
      const response = await fetch(
        `/api/yugioh-cards?userId=${user.id}&limit=1000&_t=${cacheBuster}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch Yugioh cards');
      }

      const data = await response.json();
      const cards: YugiohUserCard[] = Array.isArray(data.data) ? data.data : [];

      setAllCards(cards);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load Yugioh cards',
      );
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
          card.cardData.cardTitle?.toLowerCase().includes(query) ||
          card.cardData.cardType?.toLowerCase().includes(query) ||
          card.cardData.cardSubtype?.toLowerCase().includes(query) ||
          card.cardData.cardAttr?.toLowerCase().includes(query),
      );
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(card => card.cardData.cardType === filterType);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let compareResult = 0;

      switch (sortBy) {
        case 'name':
          compareResult = (a.cardData.cardTitle || '').localeCompare(
            b.cardData.cardTitle || '',
          );
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
  }, [allCards, searchQuery, filterType, sortBy, sortOrder]);

  // Paginate the filtered results
  const paginatedCards = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAndSortedCards.slice(start, end);
  }, [filteredAndSortedCards, page]);

  // Update cards and total when filtered results change
  useEffect(() => {
    setCards(paginatedCards);
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
  const uniqueTypes = useMemo(
    () =>
      [
        ...new Set(
          allCards.map(card => card.cardData.cardType).filter(Boolean),
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
      allCards[0] || { likes: 0, cardData: { cardTitle: 'None' } },
    );

    return {
      total: allCards.length,
      thisMonth,
      mostLiked: mostLikedCard.cardData?.cardTitle || 'None',
    };
  }, [allCards]);

  useEffect(() => {
    fetchYugiohCards();
  }, [fetchYugiohCards]);

  const handleShareCard = (card: YugiohUserCard) => {
    if (navigator.share && card.imageData?.dataUrl) {
      fetch(card.imageData.dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File(
            [blob],
            `${card.cardData.cardTitle || 'YugiohCard'}.png`,
            { type: 'image/png' },
          );
          navigator.share({
            title: `Check out my ${card.cardData.cardTitle} duel card!`,
            text: `I created this ${card.cardData.cardTitle} duel card!`,
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
          `Check out my ${card.cardData.cardTitle} duel card!`,
        );
        alert('Card description copied to clipboard!');
      } else {
        alert('Sharing is not supported on this device');
      }
    }
  };

  const handleDownloadCard = (card: YugiohUserCard) => {
    if (card.imageData?.dataUrl) {
      const link = document.createElement('a');
      link.href = card.imageData.dataUrl;
      link.download = `${card.cardData.cardTitle || 'YugiohCard'}.png`;
      link.click();
    }
  };

  if (!user) {
    return (
      <>
        <SEO
          title="Duel Gallery - Login Required"
          description="View and manage your duel card collection"
        />
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to be logged in to view your duel card collection.
          </Typography>
          <Button
            component={Link}
            href="/duel-creator"
            variant="contained"
            size="large"
          >
            Go to Duel Creator
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title="My Duel Gallery"
        description="View and manage your duel card collection"
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <DuelGalleryHeader stats={stats} showStats={allCards.length > 0} />

          {/* Control Panel */}
          <Paper
            elevation={1}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <DuelGalleryControls
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

            <DuelGalleryFilters
              showFilters={showFilters}
              showEditMenu={showEditMenu}
              filterType={filterType}
              setFilterType={setFilterType}
              uniqueTypes={uniqueTypes}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              totalPublic={filteredAndSortedCards.length}
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
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" component="h2" gutterBottom>
                Start Your Duel Collection
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
              >
                Create your first custom duel card to begin building your
                personal gallery.
              </Typography>
              <Button
                component={Link}
                href="/duel-creator"
                variant="contained"
                size="large"
              >
                Create Duel Card
              </Button>
            </Paper>
          </Fade>
        )}

        {cards.length > 0 && (
          <Grid container spacing={3}>
            {cards.map(card => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <YugiohGalleryCardComponent
                  card={card}
                  onShare={handleShareCard}
                  onDownload={handleDownloadCard}
                />
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
                <Button
                  variant="outlined"
                  onClick={() => {
                    setFilterType('all');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </Button>
              </Box>
            </Fade>
          )}
      </Container>
    </>
  );
};

export default DuelGalleryClientPage;

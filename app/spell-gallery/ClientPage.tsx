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
import { MTGCardDisplayWrapper } from '@components/CardDisplayWrapper';
import { MTGCardData } from '@components/CardDisplayWrapper/types';

interface MTGUserCard {
  id: number;
  cardData: MTGCardData;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
  };
  createdAt: string;
  likes?: number;
  isPublic: boolean;
  name: string;
  type: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  description?: string;
  cardEditorState?: any;
}

// MTG gallery card component using the MTGCardDisplayWrapper
const MTGGalleryCardComponent = ({
  card,
  onShare,
  onDownload,
}: {
  card: MTGUserCard;
  onShare: (card: MTGUserCard) => void;
  onDownload: (card: MTGUserCard) => void;
}) => {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  // Load initial likes state
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/mtg-cards/${card.id}/likes`)
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
      const res = await fetch(`/api/mtg-cards/${card.id}/likes`, {
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
    router.push(`/spell-gallery/${card.id}`);
  };

  const getRarityColor = (rarity: string) => {
    const rarityColors: Record<string, string> = {
      common: '#000000',
      uncommon: '#C0C0C0',
      rare: '#FFD700',
      mythic: '#FF8C00',
    };
    return rarityColors[rarity.toLowerCase()] || '#000000';
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
        <MTGCardDisplayWrapper
          card={{
            id: card.id,
            name: card.name,
            type: card.type,
            supertype: 'Card',
            rarity: card.rarity,
            description: card.description,
            isPublic: card.isPublic,
            createdAt: card.createdAt,
            imageData: card.imageData,
            cardEditorState: card.cardEditorState,
          }}
          width={280}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="h3" gutterBottom>
          {card.name || 'Untitled Card'}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <Chip label={card.type} size="small" />
          <Chip
            label={card.rarity}
            size="small"
            variant="outlined"
            sx={{
              borderColor: getRarityColor(card.rarity),
              color: getRarityColor(card.rarity),
            }}
          />
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

const SpellGalleryClientPage: FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const [cards, setCards] = useState<MTGUserCard[]>([]);
  const [allCards, setAllCards] = useState<MTGUserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialRender, setInitialRender] = useState(true);

  // Search and Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'likes'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRarity, setFilterRarity] = useState<string>('all');

  // Pagination
  const itemsPerPage = 20;
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchMTGCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const cacheBuster = Date.now();
      const response = await fetch(
        `/api/mtg-cards?userId=${user.id}&limit=1000&_t=${cacheBuster}`,
        {
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch MTG cards');
      }

      const data = await response.json();
      const cards: MTGUserCard[] = Array.isArray(data.data) ? data.data : [];

      setAllCards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load MTG cards');
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
          card.description?.toLowerCase().includes(query),
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
    () => [...new Set(allCards.map(card => card.type).filter(Boolean))].sort(),
    [allCards],
  );

  const uniqueRarities = useMemo(
    () =>
      [...new Set(allCards.map(card => card.rarity).filter(Boolean))].sort(),
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
    fetchMTGCards();
  }, [fetchMTGCards]);

  const handleShareCard = (card: MTGUserCard) => {
    if (navigator.share && card.imageData?.dataUrl) {
      fetch(card.imageData.dataUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${card.name || 'MTGCard'}.png`, {
            type: 'image/png',
          });
          navigator.share({
            title: `Check out my ${card.name} spell card!`,
            text: `I created this ${card.name} spell card!`,
            files: [file],
          });
        })
        .catch(err => {
          console.error('Sharing failed:', err);
          alert('Sharing is not supported on this device');
        });
    } else {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(`Check out my ${card.name} spell card!`);
        alert('Card description copied to clipboard!');
      } else {
        alert('Sharing is not supported on this device');
      }
    }
  };

  const handleDownloadCard = (card: MTGUserCard) => {
    if (card.imageData?.dataUrl) {
      const link = document.createElement('a');
      link.href = card.imageData.dataUrl;
      link.download = `${card.name || 'MTGCard'}.png`;
      link.click();
    }
  };

  if (!user) {
    return (
      <>
        <SEO
          title="Spell Gallery - Login Required"
          description="View and manage your spell card collection"
        />
        <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Login Required
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            You need to be logged in to view your Magic: The Gathering card
            collection.
          </Typography>
          <Button
            component={Link}
            href="/spell-editor"
            variant="contained"
            size="large"
          >
            Go to Spell Editor
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO
        title="My Spell Gallery"
        description="View and manage your spell card collection"
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{ fontWeight: 800, mb: 2 }}
          >
            My Spell Gallery
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
            Your spell card collection
          </Typography>

          {/* Stats Section */}
          {allCards.length > 0 && (
            <Stack direction="row" spacing={4} sx={{ mb: 3 }}>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: 'primary.main' }}
                >
                  {stats.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Cards
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: 'success.main' }}
                >
                  {stats.thisMonth}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This Month
                </Typography>
              </Box>
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {stats.mostLiked}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Most Liked
                </Typography>
              </Box>
            </Stack>
          )}

          {/* Control Panel */}
          <Paper elevation={1} sx={{ p: 3, borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <input
                  type="text"
                  placeholder="Search cards..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  <option value="all">All Types</option>
                  {uniqueTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} md={2}>
                <select
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  <option value="all">All Rarities</option>
                  {uniqueRarities.map(rarity => (
                    <option key={rarity} value={rarity}>
                      {rarity}
                    </option>
                  ))}
                </select>
              </Grid>
              <Grid item xs={12} md={2}>
                <select
                  value={sortBy}
                  onChange={e =>
                    setSortBy(e.target.value as 'name' | 'date' | 'likes')
                  }
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    fontSize: '14px',
                  }}
                >
                  <option value="date">Sort by Date</option>
                  <option value="name">Sort by Name</option>
                  <option value="likes">Sort by Likes</option>
                </select>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  onClick={() =>
                    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                  }
                  variant="outlined"
                  fullWidth
                >
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </Grid>
            </Grid>
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
                Start Your Spell Collection
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
              >
                Create your first custom spell card to begin building your
                personal gallery.
              </Typography>
              <Button
                component={Link}
                href="/spell-editor"
                variant="contained"
                size="large"
              >
                Create Spell Card
              </Button>
            </Paper>
          </Fade>
        )}

        {cards.length > 0 && (
          <Grid container spacing={3}>
            {cards.map(card => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                <MTGGalleryCardComponent
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
                    setFilterRarity('all');
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

export default SpellGalleryClientPage;

import { FC, useCallback, useEffect, useState } from 'react';
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
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Pagination,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PersonIcon from '@mui/icons-material/Person';
import { Link } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import CommentsSection from '@/components/CommentsSection';
import StarRating from '@/components/StarRating';
import { SEO } from '@layout';

interface CommunityCard {
    id: number;
    name: string;
    description?: string;
    type: string;
    subtype?: string;
    supertype: string;
    rarity: string;
    hitpoints?: number;
    illustrator?: string;
    imageData?: string;
    createdAt: string;
    creatorUsername?: string;
    creatorUserId?: string;
    likesCount: number;
    rating?: number;
    ratingCount?: number;
    commentCount?: number;
}

interface PaginationInfo {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

const CommunityPage: FC = () => {
    const { data: session, status } = useSession();
    const userId = session?.user?.id;
    const isLoaded = status !== 'loading';
    const [cards, setCards] = useState<CommunityCard[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [collectingCardId, setCollectingCardId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Filters
    const [search, setSearch] = useState('');
    const [sortFilter, setSortFilter] = useState('recent');
    const [rarityFilter, setRarityFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    // Likes state
    const [likedCards, setLikedCards] = useState<Set<number>>(new Set());

    const fetchCommunityCards = useCallback(
        async (page = 1) => {
            try {
                setLoading(true);
                setError(null);

                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: '20',
                });

                if (search) params.append('search', search);
                if (sortFilter) params.append('sort', sortFilter);
                if (rarityFilter) params.append('rarity', rarityFilter);
                if (typeFilter) params.append('type', typeFilter);

                const response = await fetch(`/api/community/cards?${params}`);
                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch cards');
                }

                setCards(data.cards);
                setPagination(data.pagination);
            } catch (err) {
                setError(
                    err instanceof Error
                        ? err.message
                        : 'Failed to fetch community cards',
                );
            } finally {
                setLoading(false);
            }
        },
        [search, sortFilter, rarityFilter, typeFilter],
    );

    useEffect(() => {
        if (isLoaded) {
            fetchCommunityCards();
        }
    }, [isLoaded, fetchCommunityCards]);

    const handleCollectCard = async (cardId: number, cardName: string) => {
        if (!userId) return;

        setCollectingCardId(cardId);

        try {
            const response = await fetch('/api/community/collect-card', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cardId }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 400 && data.error === 'Insufficient credits') {
                    throw new Error(
                        `Not enough credits. Need ${data.required}, you have ${data.balance}`,
                    );
                }
                throw new Error(data.error || 'Failed to collect card');
            }

            setSuccess(`Successfully collected "${cardName}"!`);
            // Remove the card from the list since it's been collected
            setCards(cards.filter(card => card.id !== cardId));
            setPagination(prev =>
                prev
                    ? {
                        ...prev,
                        totalCount: prev.totalCount - 1,
                    }
                    : null,
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to collect card');
        } finally {
            setCollectingCardId(null);
        }
    };

    const handlePageChange = (
        _event: React.ChangeEvent<unknown>,
        page: number,
    ) => {
        fetchCommunityCards(page);
    };

    const handleLike = async (cardId: number, cardName: string) => {
        if (!userId) return;

        const wasLiked = likedCards.has(cardId);
        const action = wasLiked ? 'unlike' : 'like';

        // Optimistically update UI
        setLikedCards(prev => {
            const newSet = new Set(prev);
            if (wasLiked) {
                newSet.delete(cardId);
            } else {
                newSet.add(cardId);
            }
            return newSet;
        });

        // Update card likes count optimistically
        setCards(prevCards =>
            prevCards.map(card =>
                card.id === cardId
                    ? { ...card, likesCount: card.likesCount + (wasLiked ? -1 : 1) }
                    : card,
            ),
        );

        try {
            const response = await fetch(`/api/cards/${cardId}/likes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ action }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Failed to ${action} card`);
            }

            // Update local state with server response
            setLikedCards(prev => {
                const newSet = new Set(prev);
                if (data.data.isLiked) {
                    newSet.add(cardId);
                } else {
                    newSet.delete(cardId);
                }
                return newSet;
            });
            setCards(prevCards =>
                prevCards.map(card =>
                    card.id === cardId ? { ...card, likesCount: data.data.count } : card,
                ),
            );
        } catch (err) {
            // Revert optimistic update on error
            setLikedCards(prev => {
                const newSet = new Set(prev);
                if (!wasLiked) {
                    newSet.delete(cardId);
                } else {
                    newSet.add(cardId);
                }
                return newSet;
            });

            // Revert card likes count
            setCards(prevCards =>
                prevCards.map(card =>
                    card.id === cardId
                        ? { ...card, likesCount: card.likesCount + (wasLiked ? 1 : -1) }
                        : card,
                ),
            );

            const errorMsg =
                err instanceof Error ? err.message : `Failed to ${action} card`;
            setError(`Failed to ${action} "${cardName}": ${errorMsg}`);
        }
    };

    const getRarityColor = (rarity: string) => {
        const rarityLower = rarity.toLowerCase();
        if (rarityLower.includes('rare') || rarityLower.includes('legendary'))
            return '#FFD700';
        if (rarityLower.includes('uncommon')) return '#C0C0C0';
        return '#CD7F32'; // common
    };

    if (!isLoaded || loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading community cards...</Typography>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <SEO title="Community Card Pool" description="Discover and collect cards created by the community." />
            <Stack spacing={4}>
                {/* Header */}
                <Box textAlign="center">
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        gutterBottom
                        sx={{ fontSize: { xs: '2rem', md: '2.5rem' } }}
                    >
                        🃏 Community Card Pool
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.1rem' }}
                    >
                        Discover and collect cards created by the community. Support fellow
                        creators and expand your collection!
                    </Typography>
                </Box>

                {/* Success/Error Messages */}
                {error && (
                    <Alert severity="error" onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}
                {success && (
                    <Alert severity="success" onClose={() => setSuccess(null)}>
                        {success}
                    </Alert>
                )}

                {/* Filters */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <TextField
                            fullWidth
                            label="Search cards"
                            variant="outlined"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search by name or description..."
                        />
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Sort By</InputLabel>
                            <Select
                                value={sortFilter}
                                label="Sort By"
                                onChange={e => setSortFilter(e.target.value)}
                            >
                                <MenuItem value="recent">Recent</MenuItem>
                                <MenuItem value="popular">Popular</MenuItem>
                                <MenuItem value="top-rated">Top Rated</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Rarity</InputLabel>
                            <Select
                                value={rarityFilter}
                                label="Rarity"
                                onChange={e => setRarityFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Common">Common</MenuItem>
                                <MenuItem value="Uncommon">Uncommon</MenuItem>
                                <MenuItem value="Rare">Rare</MenuItem>
                                <MenuItem value="Legendary">Legendary</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Type</InputLabel>
                            <Select
                                value={typeFilter}
                                label="Type"
                                onChange={e => setTypeFilter(e.target.value)}
                            >
                                <MenuItem value="">All</MenuItem>
                                <MenuItem value="Grass">Grass</MenuItem>
                                <MenuItem value="Fire">Fire</MenuItem>
                                <MenuItem value="Water">Water</MenuItem>
                                <MenuItem value="Lightning">Lightning</MenuItem>
                                <MenuItem value="Psychic">Psychic</MenuItem>
                                <MenuItem value="Fighting">Fighting</MenuItem>
                                <MenuItem value="Darkness">Darkness</MenuItem>
                                <MenuItem value="Metal">Metal</MenuItem>
                                <MenuItem value="Fairy">Fairy</MenuItem>
                                <MenuItem value="Dragon">Dragon</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {/* Cards Grid */}
                {cards.length === 0 ? (
                    <Box textAlign="center" py={8}>
                        <Typography variant="h6" color="text.secondary">
                            No cards found in the community pool yet. Be the first to share
                            your creations!
                        </Typography>
                    </Box>
                ) : (
                    <>
                        <Grid container spacing={3}>
                            {cards.map(card => (
                                <Grid item xs={12} sm={6} md={4} lg={3} key={card.id}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            transition: 'transform 0.2s',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ flexGrow: 1, p: 2 }}>
                                            <Box sx={{ mb: 1 }}>
                                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                                    {card.name}
                                                </Typography>
                                                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                                    <Chip
                                                        label={card.rarity}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: getRarityColor(card.rarity),
                                                            color: 'white',
                                                            fontWeight: 600,
                                                        }}
                                                    />
                                                    <Chip
                                                        label={card.type}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Stack>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mb: 1 }}
                                            >
                                                {card.description ||
                                                    'A wonderful community-created card!'}
                                            </Typography>

                                            {card.hitpoints && (
                                                <Typography variant="body2" color="text.secondary">
                                                    HP: {card.hitpoints}
                                                </Typography>
                                            )}

                                            {card.creatorUsername && (
                                                <Box
                                                    sx={{
                                                        mt: 2,
                                                        pt: 2,
                                                        borderTop: '1px solid',
                                                        borderColor: 'divider',
                                                    }}
                                                >
                                                    <Box
                                                        component={Link}
                                                        to={`/u/${card.creatorUsername}`}
                                                        sx={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            color: 'text.secondary',
                                                            textDecoration: 'none',
                                                            '&:hover': {
                                                                color: 'primary.main',
                                                                textDecoration: 'underline',
                                                            },
                                                        }}
                                                    >
                                                        <PersonIcon sx={{ fontSize: 16, mr: 0.5 }} />
                                                        <Typography variant="caption">
                                                            by {card.creatorUsername}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}

                                            {/* Rating and Likes */}
                                            <Stack direction="column" spacing={1} sx={{ mt: 1 }}>
                                                {/* Star Rating */}
                                                <StarRating
                                                    rating={card.rating || 0}
                                                    count={card.ratingCount}
                                                    size="small"
                                                    readOnly={!userId}
                                                />

                                                {/* Likes */}
                                                <Stack
                                                    direction="row"
                                                    spacing={1}
                                                    sx={{ alignItems: 'center' }}
                                                >
                                                    {userId && (
                                                        <IconButton
                                                            size="small"
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                handleLike(card.id, card.name);
                                                            }}
                                                            sx={{
                                                                color: likedCards.has(card.id)
                                                                    ? '#e91e63'
                                                                    : 'text.secondary',
                                                                '&:hover': {
                                                                    color: '#e91e63',
                                                                },
                                                                p: 0.5,
                                                            }}
                                                        >
                                                            {likedCards.has(card.id) ? (
                                                                <FavoriteIcon />
                                                            ) : (
                                                                <FavoriteBorderIcon />
                                                            )}
                                                        </IconButton>
                                                    )}
                                                    <Typography variant="caption" color="text.secondary">
                                                        {card.likesCount}{' '}
                                                        {card.likesCount === 1 ? 'like' : 'likes'}
                                                    </Typography>
                                                </Stack>
                                            </Stack>

                                            {/* Comments */}
                                            <CommentsSection
                                                cardId={card.id}
                                                commentCount={card.commentCount}
                                            />
                                        </CardContent>

                                        <CardActions sx={{ p: 2, pt: 0 }}>
                                            <Button
                                                variant="contained"
                                                fullWidth
                                                onClick={() => handleCollectCard(card.id, card.name)}
                                                disabled={collectingCardId === card.id || !userId}
                                                sx={{
                                                    backgroundColor: '#1976d2',
                                                    '&:hover': { backgroundColor: '#1565c0' },
                                                }}
                                            >
                                                {collectingCardId === card.id ? (
                                                    <CircularProgress size={20} color="inherit" />
                                                ) : (
                                                    'Collect (10 credits)'
                                                )}
                                            </Button>
                                        </CardActions>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={pagination.totalPages}
                                    page={pagination.page}
                                    onChange={handlePageChange}
                                    color="primary"
                                    size="large"
                                />
                            </Box>
                        )}
                    </>
                )}
            </Stack>
        </Container>
    );
};

export default CommunityPage;

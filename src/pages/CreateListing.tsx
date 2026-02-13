import React, { FC, useCallback, useEffect, useState } from 'react';
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
    Divider,
    FormControlLabel,
    Grid,
    Link as MUILink,
    MenuItem,
    Pagination,
    Paper,
    Skeleton,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
} from '@mui/material';
import {
    Add as AddIcon,
    Search as SearchIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import {
    CardDisplayWrapper,
    LazyCardRenderer,
    useCardLoadingState,
} from '@/components/CardDisplayWrapper';

const CreateListingPage: FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const user = session?.user;
    const isMobile = useMediaQuery('(max-width:960px)');
    const [cards, setCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [sourceFilter, setSourceFilter] = useState<'all' | 'booster' | 'custom'>('all');
    const [selectedCards, setSelectedCards] = useState<number[]>([]);
    const [bulkPrice, setBulkPrice] = useState('');
    const itemsPerPage = 24;

    const { handleCardLoad, isCardLoaded } = useCardLoadingState();

    const fetchCards = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const params = new URLSearchParams({
                userId: user.id,
                limit: String(itemsPerPage),
                offset: String((page - 1) * itemsPerPage),
                view: 'full',
            });
            if (searchTerm.trim()) params.set('search', searchTerm.trim());
            if (sourceFilter !== 'all') params.set('source', sourceFilter);

            const response = await fetch(`/api/cards?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to fetch cards');
            const data = await response.json();

            // Enrich with listing status
            const cardIds = data.data.map((c: any) => c.id);
            const statusRes = await fetch('/api/marketplace/status', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardIds }),
            });
            const statusData = await statusRes.json();
            const listingMap = new Map(statusData.data?.map((l: any) => [l.cardId, l]) || []);

            const enriched = data.data.map((card: any) => {
                const listing: any = listingMap.get(card.id);
                return {
                    ...card,
                    listingStatus: listing ? listing.status : 'unlisted',
                };
            });

            setCards(enriched);
            setTotal(data.total || enriched.length);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cards');
        } finally {
            setLoading(false);
        }
    }, [user?.id, page, searchTerm, sourceFilter]);

    useEffect(() => { fetchCards(); }, [fetchCards]);

    const unlistedCards = cards.filter(c => c.listingStatus === 'unlisted');

    const handleCreateListings = async () => {
        const price = parseFloat(bulkPrice);
        if (isNaN(price) || price <= 0) return;

        try {
            const promises = selectedCards.map(cardId =>
                fetch('/api/marketplace', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cardId, priceCredits: price }),
                })
            );
            await Promise.all(promises);
            navigate('/marketplace/manage/listings');
        } catch (err) {
            setError('Failed to create listings');
        }
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <SEO title="Create Listings" description="Sell your cards on the marketplace." />
                <Alert severity="info">Please sign in to create listings.</Alert>
            </Container>
        );
    }

    return (
        <>
            <SEO title="Create Listings | PlayMore TCG" description="List cards from your collection for sale on the marketplace." />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MUILink component={Link} to="/">Home</MUILink>
                    <MUILink component={Link} to="/marketplace">Marketplace</MUILink>
                    <MUILink component={Link} to="/marketplace/manage">Manage</MUILink>
                    <Typography color="text.primary">Create Listing</Typography>
                </Breadcrumbs>

                <Typography variant="h4" fontWeight={800} gutterBottom>Create New Listings</Typography>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                            <TextField
                                size="small"
                                placeholder="Search cards..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                            <TextField
                                select
                                size="small"
                                value={sourceFilter}
                                onChange={e => setSourceFilter(e.target.value as any)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="all">All Cards</MenuItem>
                                <MenuItem value="booster">Booster Only</MenuItem>
                                <MenuItem value="custom">Creator-Made</MenuItem>
                            </TextField>
                        </Stack>

                        {selectedCards.length > 0 && (
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    size="small"
                                    type="number"
                                    label="Price (credits)"
                                    value={bulkPrice}
                                    onChange={e => setBulkPrice(e.target.value)}
                                    sx={{ width: 150 }}
                                />
                                <Button variant="contained" onClick={handleCreateListings}>
                                    List {selectedCards.length} Cards
                                </Button>
                            </Stack>
                        )}
                    </CardContent>
                </Card>

                <Grid container spacing={2}>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rectangular" height={300} /></Grid>
                        ))
                    ) : (
                        unlistedCards.map(card => (
                            <Grid item xs={6} sm={4} md={3} key={card.id}>
                                <LazyCardRenderer card={card} isLoaded={isCardLoaded(card.id)} onLoad={() => handleCardLoad(card.id)}>
                                    <Card sx={{ height: '100%', position: 'relative' }}>
                                        <Checkbox
                                            sx={{ position: 'absolute', top: 8, left: 8, zIndex: 1 }}
                                            checked={selectedCards.includes(card.id)}
                                            onChange={e => {
                                                setSelectedCards(prev => e.target.checked
                                                    ? [...prev, card.id]
                                                    : prev.filter(id => id !== card.id)
                                                );
                                            }}
                                        />
                                        <Box sx={{ p: 1, backgroundColor: '#f8f9fa', minHeight: 250, display: 'flex', justifyContent: 'center' }}>
                                            <CardDisplayWrapper card={card} width="responsive" />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="subtitle2" noWrap>{card.name}</Typography>
                                            <Chip size="small" label={card.type} />
                                        </CardContent>
                                    </Card>
                                </LazyCardRenderer>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Container>
        </>
    );
};

export default CreateListingPage;

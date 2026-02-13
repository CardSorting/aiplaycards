'use client';
import { useSession } from 'next-auth/react';

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
import { useRouter, useParams } from 'next/navigation';
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
    CardDisplayWrapper,
    MTGCardDisplayWrapper,
    YugiohCardDisplayWrapper,
    LazyCardRenderer,
    normalizeCardData,
    useCardLoadingState,
} from '@components/CardDisplayWrapper';

interface Listing extends CardData {
    id: number;
    priceCredits: number;
    priceUsd: string;
    sellerUserId: string;
    sellerUsername?: string;
    createdAt: string;
    // YuGiOh specific
    cardType?: string;
    cardSubtype?: string;
    cardRare?: string;
    cardAttr?: string;
    cardRace?: string;
    cardLevel?: string;
    cardATK?: string;
    cardDEF?: string;
    description?: string;
    isPendulum?: boolean;
    cardPendulumInfo?: string;
    // Special collection specific
    imageUrl?: string;
    rarity?: string;
    categoryName?: string;
    categoryColor?: string;
}

const CATEGORY_CONFIG: Record<string, {
    title: string;
    description: string;
    category: string;
    cardTypes?: string[];
    cardRarities?: string[];
    useMTGWrapper?: boolean;
    useYugiohWrapper?: boolean;
    useImageUrl?: boolean;
}> = {
    monster: {
        title: 'Monster Marketplace',
        description: 'Discover and collect unique monster trading cards from the community',
        category: 'monster',
        cardTypes: ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Fighting', 'Dark', 'Metal', 'Dragon', 'Fairy', 'Colorless'],
    },
    pokemon: {
        title: 'Monster Marketplace',
        description: 'Discover and collect unique monster trading cards from the community',
        category: 'monster',
        cardTypes: ['Fire', 'Water', 'Grass', 'Electric', 'Psychic', 'Fighting', 'Dark', 'Metal', 'Dragon', 'Fairy', 'Colorless'],
    },
    duel: {
        title: 'Duel Marketplace',
        description: 'Find powerful duel monsters, spells, and traps',
        category: 'duel',
        cardTypes: ['Monster', 'Spell', 'Trap'],
        cardRarities: ['N', 'R', 'SR', 'UR'],
        useYugiohWrapper: true,
    },
    yugioh: {
        title: 'Duel Marketplace',
        description: 'Find powerful duel monsters, spells, and traps',
        category: 'duel',
        cardTypes: ['Monster', 'Spell', 'Trap'],
        cardRarities: ['N', 'R', 'SR', 'UR'],
        useYugiohWrapper: true,
    },
    spell: {
        title: 'Spell Marketplace',
        description: 'Discover powerful spells, creatures, and artifacts',
        category: 'spell',
        cardTypes: ['Artifact', 'Creature', 'Enchantment', 'Instant', 'Land', 'Planeswalker', 'Sorcery', 'Tribal'],
        useMTGWrapper: true,
    },
    mtg: {
        title: 'Spell Marketplace',
        description: 'Discover powerful spells, creatures, and artifacts',
        category: 'spell',
        cardTypes: ['Artifact', 'Creature', 'Enchantment', 'Instant', 'Land', 'Planeswalker', 'Sorcery', 'Tribal'],
        useMTGWrapper: true,
    },
    special: {
        title: 'Special Collection Marketplace',
        description: 'Discover and collect exclusive special cards from the community',
        category: 'special',
        cardRarities: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        useImageUrl: true,
    },
};

const sortOptions = [
    { value: 'new', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
];

export default function CategoryMarketplacePage() {
    const params = useParams();
    const router = useRouter();
    const slug = params?.slug as string;
    const config = CATEGORY_CONFIG[slug] || CATEGORY_CONFIG['monster'];

    const { data: session } = useSession();
    const isMobile = useMediaQuery('(max-width:960px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');

    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc'>('new');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [debouncedMin, setDebouncedMin] = useState<number | undefined>(undefined);
    const [debouncedMax, setDebouncedMax] = useState<number | undefined>(undefined);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [favoriteListings, setFavoriteListings] = useState<Set<number>>(new Set());

    const { handleCardLoad, isCardLoaded } = useCardLoadingState();

    const filteredListings = (items: Listing[]) => {
        let filtered = items;
        if (selectedTypes.length > 0) {
            filtered = filtered.filter(i => selectedTypes.includes(i.type) || selectedTypes.includes(i.cardType || ''));
        }
        if (selectedRarities.length > 0) {
            filtered = filtered.filter(i => {
                const rarity = i.cardRare || i.rarity || '';
                return selectedRarities.includes(rarity);
            });
        }
        return filtered;
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
        selectedRarities.length +
        (debouncedMin ? 1 : 0) +
        (debouncedMax ? 1 : 0) +
        (search.trim() ? 1 : 0);

    const clearAllFilters = () => {
        setSearch('');
        setSelectedTypes([]);
        setSelectedRarities([]);
        setMinPrice('');
        setMaxPrice('');
    };

    const getRarityColor = (rarity: string) => {
        switch (rarity.toLowerCase()) {
            case 'common': return '#9e9e9e';
            case 'uncommon': return '#4caf50';
            case 'rare': return '#2196f3';
            case 'epic': return '#9c27b0';
            case 'legendary': return '#ff9800';
            default: return '#1976d2';
        }
    };

    useEffect(() => {
        let active = true;
        async function load() {
            try {
                const params = new URLSearchParams({
                    limit: '30',
                    offset: String((page - 1) * 30),
                    category: config.category,
                });
                if (debouncedMin != null) params.set('minPrice', String(debouncedMin));
                if (debouncedMax != null) params.set('maxPrice', String(debouncedMax));
                if (search.trim()) params.set('search', search.trim());
                if (sort) params.set('sort', sort);

                const res = await fetch(`/api/marketplace?${params.toString()}`);
                if (!res.ok) {
                    console.error(`${config.category} marketplace API error:`, res.status, res.statusText);
                    return;
                }
                const data = await res.json();
                if (!active) return;

                const normalizedListings: Listing[] = Array.isArray(data?.data)
                    ? data.data.map((listing: any) => ({
                        ...normalizeCardData(listing),
                        id: listing.id,
                        priceCredits: listing.priceCredits,
                        priceUsd: listing.priceUsd,
                        sellerUserId: listing.sellerUserId,
                        sellerUsername: listing.sellerUsername,
                        createdAt: listing.createdAt,
                        cardType: listing.cardType,
                        cardRare: listing.cardRare,
                        rarity: listing.rarity,
                        imageUrl: listing.imageUrl,
                        categoryName: listing.categoryName,
                        categoryColor: listing.categoryColor,
                    }))
                    : [];

                setTotal(Number(data?.total || 0));
                setListings(normalizedListings);
            } catch (error) {
                console.error(`Error fetching ${config.category} marketplace data:`, error);
                if (active) setListings([]);
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [search, sort, page, debouncedMin, debouncedMax, config.category]);

    useEffect(() => {
        setPage(1);
    }, [search, sort, debouncedMin, debouncedMax]);

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

    const getCardWrapper = (listing: Listing) => {
        if (config.useYugiohWrapper) return 'yugioh';
        if (config.useMTGWrapper) return 'mtg';
        return 'default';
    };

    const renderCardDisplay = (listing: Listing) => {
        const wrapperType = getCardWrapper(listing);

        if (wrapperType === 'yugioh') {
            return (
                <YugiohCardDisplayWrapper
                    cardData={{
                        cardTitle: listing.name || '',
                        cardType: (listing.cardType as any) || 'Monster',
                        cardSubtype: listing.cardSubtype || '',
                        cardRare: listing.cardRare || 'N',
                        cardAttr: (listing.cardAttr as any) || 'EARTH',
                        cardRace: listing.cardRace || '',
                        cardLevel: listing.cardLevel || '1',
                        cardATK: listing.cardATK || '0',
                        cardDEF: listing.cardDEF || '0',
                        cardInfo: listing.description || '',
                        uiLang: 'en',
                        cardLang: 'en',
                        holo: false,
                        titleColor: '#000000',
                        cardLoadYgoProEnabled: false,
                        cardKey: '',
                        cardImg: null,
                        cardEff1: '',
                        cardEff2: '',
                        cardCustomRaceEnabled: false,
                        cardCustomRace: '',
                        Pendulum: listing.isPendulum || false,
                        Special: false,
                        cardBLUE: 0,
                        cardRED: 0,
                        pendulumSize: 0,
                        cardPendulumInfo: listing.cardPendulumInfo || '',
                        links: {},
                        infoSize: '12',
                    }}
                    width="100%"
                    aspectRatio="4/3"
                />
            );
        }

        if (wrapperType === 'mtg') {
            return <MTGCardDisplayWrapper card={listing} width="responsive" />;
        }

        if (config.useImageUrl && listing.imageUrl) {
            return (
                <img
                    src={listing.imageUrl}
                    alt={listing.name}
                    style={{ width: '100%', height: 'auto', objectFit: 'contain', borderRadius: '4px' }}
                />
            );
        }

        return <CardDisplayWrapper card={listing} width="responsive" />;
    };

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
            {/* Header Section */}
            <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ mb: { xs: 3, md: 4 } }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MUILink component={Link} href="/">Home</MUILink>
                    <MUILink component={Link} href="/marketplace">Marketplace</MUILink>
                    <Typography color="text.primary">{config.title}</Typography>
                </Breadcrumbs>

                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                    gap={2}
                >
                    <Box>
                        <Typography variant={isSmallMobile ? 'h4' : 'h3'} fontWeight={700} sx={{ mb: 1 }}>
                            {config.title}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                            {config.description}
                        </Typography>
                    </Box>

                    {!isMobile && (
                        <ToggleButtonGroup
                            value={viewMode}
                            exclusive
                            onChange={(_, newMode) => newMode && setViewMode(newMode)}
                            size="small"
                        >
                            <ToggleButton value="grid" aria-label="grid view"><ViewGridIcon fontSize="small" /></ToggleButton>
                            <ToggleButton value="list" aria-label="list view"><ViewListIcon fontSize="small" /></ToggleButton>
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
                        <Box sx={{ position: 'relative', flex: 1, maxWidth: { xs: '100%', md: 400 } }}>
                            <TextField
                                fullWidth
                                size={isSmallMobile ? 'medium' : 'small'}
                                placeholder={`Search ${config.category} cards...`}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                                    endAdornment: search && (
                                        <IconButton size={isSmallMobile ? 'medium' : 'small'} onClick={() => setSearch('')}>
                                            <ClearIcon fontSize="small" />
                                        </IconButton>
                                    ),
                                }}
                            />
                        </Box>

                        <Stack direction="row" spacing={1} sx={{ width: { xs: '100%', md: 'auto' } }}>
                            <TextField
                                select
                                size={isSmallMobile ? 'medium' : 'small'}
                                value={sort}
                                onChange={e => setSort(e.target.value as any)}
                                sx={{ minWidth: { xs: 140, sm: 180 }, flex: { xs: 1, md: 'none' } }}
                                InputProps={{ startAdornment: <SortIcon sx={{ mr: 1, color: 'text.secondary' }} /> }}
                            >
                                {sortOptions.map(option => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </TextField>
                        </Stack>

                        {!loading && (
                            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: { xs: 'center', md: 'left' } }}>
                                {total} {total === 1 ? 'card' : 'cards'} found
                            </Typography>
                        )}
                    </Stack>
                </Paper>

                {/* Filters */}
                {(config.cardTypes || config.cardRarities || selectedTypes.length > 0 || selectedRarities.length > 0 || search.trim()) && (
                    <Paper elevation={1} sx={{ p: 2 }}>
                        {config.cardTypes && (
                            <>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter by Type:</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                                    {config.cardTypes.map(type => (
                                        <Chip
                                            key={type}
                                            label={type}
                                            variant={selectedTypes.includes(type) ? 'filled' : 'outlined'}
                                            clickable
                                            onClick={() => {
                                                setSelectedTypes(prev =>
                                                    prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                                                );
                                            }}
                                            sx={{ mb: 1 }}
                                        />
                                    ))}
                                </Stack>
                            </>
                        )}

                        {config.cardRarities && (
                            <>
                                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>Filter by Rarity:</Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {config.cardRarities.map(rarity => (
                                        <Chip
                                            key={rarity}
                                            label={rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                                            variant={selectedRarities.includes(rarity) ? 'filled' : 'outlined'}
                                            clickable
                                            onClick={() => {
                                                setSelectedRarities(prev =>
                                                    prev.includes(rarity) ? prev.filter(r => r !== rarity) : [...prev, rarity]
                                                );
                                            }}
                                            sx={{
                                                mb: 1,
                                                backgroundColor: selectedRarities.includes(rarity) ? getRarityColor(rarity) : undefined,
                                                color: selectedRarities.includes(rarity) ? 'white' : undefined,
                                            }}
                                        />
                                    ))}
                                </Stack>
                            </>
                        )}

                        {activeFiltersCount > 0 && (
                            <Box sx={{ mt: 2 }}>
                                <Button variant="outlined" size="small" onClick={clearAllFilters}>
                                    Clear All Filters ({activeFiltersCount})
                                </Button>
                            </Box>
                        )}
                    </Paper>
                )}
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
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, textAlign: 'center' }}>
                                Showing {Math.min((page - 1) * 30 + 1, total)} - {Math.min(page * 30, total)} of {total} results
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
                    Array.from({ length: 8 }).map((_, idx) => (
                        <Grid item xs={6} sm={6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={`skeleton-${idx}`}>
                            <Card elevation={2}>
                                <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: '#f8f9fa', display: 'flex', justifyContent: 'center' }}>
                                    <Skeleton variant="rectangular" sx={{ borderRadius: 2, width: { xs: 120, sm: 180, md: 240 }, height: { xs: 160, sm: 240, md: 320 } }} />
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
                    <Grid item xs={12}>
                        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No {config.category} cards found</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>Try adjusting your filters or search terms</Typography>
                            {activeFiltersCount > 0 && <Button variant="outlined" onClick={clearAllFilters}>Clear All Filters</Button>}
                        </Paper>
                    </Grid>
                ) : (
                    filteredListings(listings).map(listing => (
                        <Grid item xs={6} sm={6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={listing.id}>
                            <Fade in timeout={300}>
                                <Card
                                    elevation={2}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: viewMode === 'list' && !isMobile ? 'row' : 'column',
                                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        '&:hover': {
                                            transform: viewMode === 'grid' && !isMobile ? 'translateY(-8px)' : isMobile ? 'translateY(-4px)' : 'none',
                                            boxShadow: theme => theme.shadows[12],
                                            '& .cardImage': { transform: isMobile ? 'scale(1.02)' : 'scale(1.05)' },
                                            '& .priceTag': { transform: 'scale(1.1)' },
                                            '& .favoriteBtn': { opacity: 1 },
                                        },
                                    }}
                                    onClick={() => router.push(`/marketplace/${listing.id}`)}
                                >
                                    {/* Card Image Section */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            bgcolor: '#f8f9fa',
                                            p: { xs: 1, sm: viewMode === 'list' && !isMobile ? 1 : 2 },
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: { xs: 160, sm: viewMode === 'list' && !isMobile ? 120 : 200, md: viewMode === 'list' ? 120 : 280 },
                                            width: viewMode === 'list' && !isMobile ? 160 : '100%',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <LazyCardRenderer card={listing} isLoaded={isCardLoaded(listing.id)} onLoad={() => handleCardLoad(listing.id)}>
                                            <Box className="cardImage" sx={{ transition: 'transform 0.3s ease', width: { xs: 80, sm: viewMode === 'list' && !isMobile ? 100 : 140, md: viewMode === 'list' ? 100 : 240 }, display: 'flex', justifyContent: 'center' }}>
                                                {renderCardDisplay(listing)}
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
                                            onClick={e => { e.stopPropagation(); toggleFavorite(listing.id); }}
                                            sx={{
                                                position: 'absolute',
                                                top: { xs: 8, sm: 12 },
                                                right: { xs: 8, sm: 12 },
                                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                                                opacity: { xs: 1, sm: 0 },
                                                transition: 'opacity 0.2s ease',
                                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)', transform: 'scale(1.1)' },
                                            }}
                                        >
                                            {favoriteListings.has(listing.id) ? <FavoriteIcon color="error" fontSize={isSmallMobile ? 'medium' : 'small'} /> : <FavoriteBorderIcon fontSize={isSmallMobile ? 'medium' : 'small'} />}
                                        </IconButton>
                                    </Box>

                                    {/* Card Details */}
                                    <CardContent sx={{ flex: 1, p: { xs: 1, sm: 1.5, md: 2 }, '&:last-child': { pb: { xs: 1, sm: 1.5, md: 2 } } }}>
                                        <Stack spacing={{ xs: 1, sm: 1.5 }} sx={{ height: '100%' }}>
                                            <Typography variant={isSmallMobile ? 'subtitle2' : 'h6'} fontWeight={600} sx={{ lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: { xs: 1, sm: 2 }, WebkitBoxOrient: 'vertical', fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' } }}>
                                                {listing.name}
                                            </Typography>

                                            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={{ xs: 0.5, sm: 0 }}>
                                                <Stack direction="row" spacing={0.5}>
                                                    <Chip size="small" label={listing.type || listing.cardType} variant="outlined" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, height: { xs: 24, sm: 32 } }} />
                                                    {(listing.cardRare || listing.rarity) && (
                                                        <Chip
                                                            size="small"
                                                            label={listing.cardRare || listing.rarity}
                                                            sx={{
                                                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                                                height: { xs: 24, sm: 32 },
                                                                backgroundColor: getRarityColor(listing.cardRare || listing.rarity || ''),
                                                                color: 'white',
                                                            }}
                                                        />
                                                    )}
                                                </Stack>
                                                <Typography variant={isSmallMobile ? 'subtitle1' : 'h6'} fontWeight={700} color="success.main" sx={{ fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' } }}>
                                                    {listing.priceCredits} credits
                                                </Typography>
                                            </Stack>

                                            <Box sx={{ mt: 'auto', pt: { xs: 0.5, sm: 1 } }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <Button variant="contained" size={isSmallMobile ? 'small' : 'medium'} startIcon={!isSmallMobile && <ShoppingCartIcon />} sx={{ flex: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' }, py: { xs: 0.5, sm: 0.75 } }} onClick={e => { e.stopPropagation(); router.push(`/marketplace/${listing.id}`); }}>
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

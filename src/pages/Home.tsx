import { FC, useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Chip,
    CircularProgress,
    Grid,
    Pagination,
    Paper,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import CategoryIcon from '@mui/icons-material/Category';
import { SEO } from '@layout';
import { AutoAwesome, Palette, Share, Speed } from '@mui/icons-material';
import {
    CreatorSpotlights,
    FAQ,
    FeatureGrid,
    FinalCTA,
    Hero,
} from '@/home';
import { urlFriendlySlug } from '@routes';
import { PACKS } from '@features/booster/packs';

interface PackStock {
    [packSlug: string]: number;
}

interface SpecialPackCategory {
    id: number;
    name: string;
    description?: string | null;
    color: string | null;
    packCount: number;
}

const Home: FC = () => {
    const navigate = useNavigate();
    const [packStock, setPackStock] = useState<PackStock>({});
    const [loadingStock, setLoadingStock] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [specialCategories, setSpecialCategories] = useState<
        SpecialPackCategory[]
    >([]);
    const [loadingSpecial, setLoadingSpecial] = useState(true);
    const [specialPage, setSpecialPage] = useState(1);
    const categoriesPerPage = 6;

    useEffect(() => {
        const fetchPackStock = async () => {
            try {
                const response = await fetch('/api/pack-stock');
                const data = await response.json();
                if (data.success) {
                    setPackStock(data.stock);
                }
            } catch (error) {
                console.error('Failed to fetch pack stock:', error);
            } finally {
                setLoadingStock(false);
            }
        };

        const fetchSpecialPacks = async () => {
            try {
                const response = await fetch('/api/special-packs/categories');
                const data = await response.json();
                if (response.ok) {
                    setSpecialCategories(data.categories || []);
                }
            } catch (error) {
                console.error('Failed to fetch PlayMore packs:', error);
            } finally {
                setLoadingSpecial(false);
            }
        };

        fetchPackStock();
        fetchSpecialPacks();
    }, []);

    const getCategorySlug = (category: SpecialPackCategory) => {
        if (category.id === 0) {
            return 'special';
        }
        return urlFriendlySlug(category.name);
    };

    const getCategoryColor = (color: string | null | undefined) => {
        return color || '#1976d2';
    };

    // Pagination calculations
    const totalPages = Math.ceil(specialCategories.length / categoriesPerPage);
    const startIndex = (specialPage - 1) * categoriesPerPage;
    const endIndex = startIndex + categoriesPerPage;
    const currentCategories = specialCategories.slice(startIndex, endIndex);

    const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
        setSpecialPage(value);
        // Scroll to top of PlayMore packs section for better UX
        const element = document.querySelector('[data-special-packs-section]');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const renderRegularPacks = () => (
        <Grid container spacing={3}>
            {PACKS.map(pack => {
                const stock = packStock[pack.slug];
                const isOutOfStock = stock === 0;
                const isLowStock = stock > 0 && stock <= 5;

                return (
                    <Grid item key={pack.slug} xs={12} sm={6} md={4} lg={3}>
                        <Card
                            sx={{
                                overflow: 'hidden',
                                borderRadius: 2,
                                boxShadow: 4,
                                opacity: isOutOfStock ? 0.6 : 1,
                                position: 'relative',
                            }}
                        >
                            <CardActionArea
                                onClick={() =>
                                    !isOutOfStock && navigate(`/booster/${pack.slug}`)
                                }
                                disabled={isOutOfStock}
                            >
                                <Box
                                    sx={{
                                        position: 'relative',
                                        height: 160,
                                        background: pack.gradient,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Box sx={{ fontSize: 42 }}>{pack.emoji || '🎴'}</Box>
                                    </Box>

                                    {/* Stock indicator in top right */}
                                    <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
                                        {loadingStock ? (
                                            <Skeleton
                                                variant="rectangular"
                                                width={60}
                                                height={24}
                                                sx={{ borderRadius: 1 }}
                                            />
                                        ) : (
                                            <Chip
                                                label={
                                                    isOutOfStock
                                                        ? 'Sold Out'
                                                        : isLowStock
                                                            ? `${stock} left`
                                                            : `${stock} available`
                                                }
                                                size="small"
                                                color={
                                                    isOutOfStock
                                                        ? 'error'
                                                        : isLowStock
                                                            ? 'warning'
                                                            : 'success'
                                                }
                                                sx={{
                                                    fontWeight: 600,
                                                    bgcolor: isOutOfStock
                                                        ? 'error.main'
                                                        : isLowStock
                                                            ? 'warning.main'
                                                            : 'success.main',
                                                    color: 'white',
                                                    '& .MuiChip-label': {
                                                        px: 1,
                                                    },
                                                }}
                                            />
                                        )}
                                    </Box>
                                </Box>
                            </CardActionArea>
                            <CardContent>
                                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                    {pack.name}
                                </Typography>
                                {pack.description && (
                                    <Typography variant="body2" color="text.secondary">
                                        {pack.description}
                                    </Typography>
                                )}

                                {/* Stock details */}
                                {!loadingStock && (
                                    <Box sx={{ mt: 1, mb: 1.5 }}>
                                        <Typography
                                            variant="caption"
                                            color={
                                                isOutOfStock
                                                    ? 'error.main'
                                                    : isLowStock
                                                        ? 'warning.main'
                                                        : 'success.main'
                                            }
                                            sx={{ fontWeight: 600 }}
                                        >
                                            {isOutOfStock
                                                ? 'Out of stock - Pool needs refilling'
                                                : isLowStock
                                                    ? `Low stock - Only ${stock} packs remaining`
                                                    : `${stock} packs in stock`}
                                        </Typography>
                                    </Box>
                                )}

                                <Box sx={{ mt: 1.5 }}>
                                    <Button
                                        component={RouterLink}
                                        to={`/booster/${pack.slug}`}
                                        variant="contained"
                                        fullWidth
                                        disabled={isOutOfStock}
                                        sx={{
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            justifyContent: 'center',
                                            bgcolor: isOutOfStock ? 'grey.400' : undefined,
                                            '&:hover': {
                                                bgcolor: isOutOfStock ? 'grey.400' : undefined,
                                            },
                                        }}
                                    >
                                        {isOutOfStock ? 'Out of Stock' : 'Open Pack'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                );
            })}
        </Grid>
    );

    const renderSpecialPacks = () => {
        if (loadingSpecial) {
            return (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <CircularProgress size={60} sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ mt: 3, fontWeight: 600 }}>
                        Loading your exclusive collections...
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Discovering PlayMore packs curated just for you
                    </Typography>
                </Box>
            );
        }

        if (specialCategories.length === 0) {
            return (
                <Paper
                    elevation={0}
                    sx={{
                        textAlign: 'center',
                        py: 8,
                        px: 4,
                        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={3} alignItems="center">
                        <Box sx={{ position: 'relative' }}>
                            <GiftIcon
                                sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.7 }}
                            />
                            <AutoAwesome
                                sx={{
                                    position: 'absolute',
                                    top: -8,
                                    right: -8,
                                    fontSize: 32,
                                    color: 'primary.main',
                                    animation: 'pulse 2s infinite',
                                }}
                            />
                        </Box>

                        <Stack spacing={2} sx={{ maxWidth: 500 }}>
                            <Typography variant="h4" fontWeight={700} color="text.primary">
                                No Special Collections Yet
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{ lineHeight: 1.6 }}
                            >
                                Your exclusive PlayMore packs haven't arrived yet, but when they
                                do, you'll find them organized by unique themes and categories
                                right here.
                            </Typography>
                            <Box sx={{ mt: 3 }}>
                                <Chip
                                    icon={<CategoryIcon />}
                                    label="Categories coming soon"
                                    variant="outlined"
                                    color="primary"
                                    sx={{
                                        fontSize: '0.9rem',
                                        py: 1,
                                        px: 2,
                                        fontWeight: 600,
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>
            );
        }

        return (
            <Stack spacing={4} data-special-packs-section>
                {/* Header section for PlayMore packs */}
                <Paper
                    elevation={1}
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        textAlign: 'center',
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <AutoAwesome sx={{ fontSize: 48 }} />
                        <Typography variant="h4" fontWeight={800}>
                            Your Special Collections
                        </Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9, maxWidth: 600 }}>
                            Exclusive card packs organized by unique themes and rarities,
                            curated specifically for your account
                        </Typography>
                        <Box
                            sx={{
                                display: 'flex',
                                gap: 2,
                                flexWrap: 'wrap',
                                justifyContent: 'center',
                            }}
                        >
                            <Chip
                                label={`${specialCategories.length} ${specialCategories.length === 1 ? 'Category' : 'Categories'
                                    } Available`}
                                sx={{
                                    bgcolor: 'rgba(255,255,255,0.2)',
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                }}
                            />
                            {totalPages > 1 && (
                                <Chip
                                    label={`Page ${specialPage} of ${totalPages}`}
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.15)',
                                        color: 'white',
                                        fontWeight: 600,
                                        fontSize: '0.8rem',
                                    }}
                                />
                            )}
                        </Box>
                    </Stack>
                </Paper>

                {/* Categories grid */}
                <Grid container spacing={4}>
                    {currentCategories.map((category, index) => {
                        // Calculate the actual index for numbering across pages
                        const actualIndex = startIndex + index;
                        return (
                            <Grid item xs={12} sm={6} md={4} key={category.id}>
                                <Card
                                    elevation={3}
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer',
                                        border: '3px solid transparent',
                                        borderRadius: 3,
                                        overflow: 'hidden',
                                        position: 'relative',
                                        '&:hover': {
                                            transform: 'translateY(-8px) scale(1.02)',
                                            boxShadow: `0 20px 40px rgba(${getCategoryColor(category.color)
                                                .replace('#', '')
                                                .match(/.{2}/g)
                                                ?.map(hex => parseInt(hex, 16))
                                                .join(',') || '0,0,0'
                                                }, 0.3)`,
                                            borderColor: getCategoryColor(category.color),
                                        },
                                    }}
                                    onClick={() =>
                                        navigate(`/special-packs/${getCategorySlug(category)}`)
                                    }
                                >
                                    {/* Gradient header with enhanced visuals */}
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            height: 180,
                                            background: `linear-gradient(135deg, ${getCategoryColor(
                                                category.color,
                                            )}33 0%, ${getCategoryColor(
                                                category.color,
                                            )}66 50%, ${getCategoryColor(category.color)}99 100%)`,
                                            overflow: 'hidden',
                                        }}
                                    >
                                        {/* Background pattern */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                background: `repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.05) 10px, rgba(255,255,255,0.05) 20px)`,
                                            }}
                                        />

                                        {/* Category number badge */}
                                        <Chip
                                            label={`#${actualIndex + 1}`}
                                            size="small"
                                            sx={{
                                                position: 'absolute',
                                                top: 12,
                                                left: 12,
                                                bgcolor: 'rgba(255,255,255,0.9)',
                                                color: getCategoryColor(category.color),
                                                fontWeight: 700,
                                                fontSize: '0.75rem',
                                            }}
                                        />

                                        {/* Main icon */}
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                inset: 0,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexDirection: 'column',
                                                gap: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    fontSize: 64,
                                                    textShadow: '2px 2px 8px rgba(0,0,0,0.3)',
                                                }}
                                            >
                                                🎁
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: 'white',
                                                    fontWeight: 700,
                                                    textShadow: '1px 1px 4px rgba(0,0,0,0.7)',
                                                    textTransform: 'uppercase',
                                                    letterSpacing: 1,
                                                }}
                                            >
                                                Special Collection
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {/* Enhanced card content */}
                                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                        <Stack spacing={2.5}>
                                            {/* Category name with enhanced styling */}
                                            <Box
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}
                                            >
                                                <Box
                                                    sx={{
                                                        width: 20,
                                                        height: 20,
                                                        borderRadius: '50%',
                                                        backgroundColor: getCategoryColor(category.color),
                                                        boxShadow: `0 2px 8px ${getCategoryColor(
                                                            category.color,
                                                        )}44`,
                                                        flexShrink: 0,
                                                    }}
                                                />
                                                <Typography
                                                    variant="h5"
                                                    fontWeight={800}
                                                    sx={{
                                                        color: 'text.primary',
                                                        lineHeight: 1.2,
                                                    }}
                                                >
                                                    {category.name}
                                                </Typography>
                                            </Box>

                                            {/* Description with better typography */}
                                            {category.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        lineHeight: 1.7,
                                                        fontSize: '0.9rem',
                                                    }}
                                                >
                                                    {category.description}
                                                </Typography>
                                            )}

                                            {/* Enhanced pack count display */}
                                            <Box
                                                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                                            >
                                                <CategoryIcon
                                                    sx={{
                                                        fontSize: 18,
                                                        color: getCategoryColor(category.color),
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color="text.primary"
                                                >
                                                    {category.packCount} exclusive pack
                                                    {category.packCount !== 1 ? 's' : ''} waiting
                                                </Typography>
                                            </Box>

                                            {/* Pack count chip with category color */}
                                            <Chip
                                                label={`${category.packCount} pack${category.packCount !== 1 ? 's' : ''
                                                    } available`}
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    bgcolor: `${getCategoryColor(category.color)}22`,
                                                    color: getCategoryColor(category.color),
                                                    fontWeight: 600,
                                                    border: `1px solid ${getCategoryColor(
                                                        category.color,
                                                    )}44`,
                                                }}
                                                size="small"
                                            />
                                        </Stack>
                                    </CardContent>

                                    {/* Enhanced action button */}
                                    <Box sx={{ p: 3, pt: 0 }}>
                                        <Button
                                            variant="contained"
                                            fullWidth
                                            size="large"
                                            startIcon={<GiftIcon />}
                                            sx={{
                                                backgroundColor: getCategoryColor(category.color),
                                                textTransform: 'none',
                                                fontWeight: 700,
                                                fontSize: '1rem',
                                                py: 1.5,
                                                borderRadius: 2,
                                                boxShadow: `0 4px 12px ${getCategoryColor(
                                                    category.color,
                                                )}44`,
                                                '&:hover': {
                                                    backgroundColor: getCategoryColor(category.color),
                                                    filter: 'brightness(0.9)',
                                                    boxShadow: `0 6px 16px ${getCategoryColor(
                                                        category.color,
                                                    )}66`,
                                                },
                                            }}
                                        >
                                            Explore Collection
                                        </Button>
                                    </Box>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                        <Paper
                            elevation={1}
                            sx={{
                                p: 2,
                                borderRadius: 2,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: 2,
                            }}
                        >
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontWeight: 600 }}
                            >
                                Showing {startIndex + 1}-
                                {Math.min(endIndex, specialCategories.length)} of{' '}
                                {specialCategories.length} collections
                            </Typography>
                            <Pagination
                                count={totalPages}
                                page={specialPage}
                                onChange={handlePageChange}
                                color="primary"
                                size="large"
                                showFirstButton
                                showLastButton
                                sx={{
                                    '& .MuiPaginationItem-root': {
                                        fontWeight: 600,
                                    },
                                }}
                            />
                        </Paper>
                    </Box>
                )}

                {/* Footer information */}
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack
                        spacing={2}
                        direction={{ xs: 'column', sm: 'row' }}
                        alignItems="center"
                        justifyContent="space-between"
                    >
                        <Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom>
                                About Special Collections
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ maxWidth: 600 }}
                            >
                                Each collection contains hand-curated cards organized by theme,
                                rarity, and artistic style. These exclusive packs are created
                                specifically for your account and feature unique artwork you
                                won't find anywhere else.
                            </Typography>
                        </Box>
                        <Chip
                            icon={<AutoAwesome />}
                            label="Exclusive Content"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, minWidth: 140 }}
                        />
                    </Stack>
                </Paper>
            </Stack>
        );
    };

    return (
        <>
            <SEO
                title="Collect Unique Digital Trading Card Packs | PlayMoreTCG"
                description="Discover unique monster-inspired artwork generated by AI. Collect one-of-a-kind robot-created art pieces, trade with fellow collectors, and build galleries of AI masterpieces."
                keywords="digital trading cards, booster pack opening, card collecting, TCG collection, trading card packs, rare card pulls"
                image="https://playmoretcg.com/assets/images/banner.png"
                url="https://playmoretcg.com"
            />

            {/* Hero: clear value prop and dual CTAs */}
            <Hero
                headline="Monster-inspired art from a robot"
                subhead="Discover unique AI-generated monster-style artwork in every pack. Each piece is one-of-a-kind art created by artificial intelligence—collect, trade, and showcase robot-made masterpieces."
                primary={{ label: 'Open your first pack', href: '/booster' }}
                secondary={{ label: 'Sign in to collect', href: '/signin' }}
                media={{
                    src: '/assets/images/demoFull.png',
                    alt: 'Interactive demo showing Trading card pack opening experience with digital cards',
                    width: 480,
                    height: 320,
                }}
            />

            {/* Benefits and top features */}
            <FeatureGrid
                title="Why art lovers choose robot-made monster art"
                items={[
                    {
                        icon: <Speed />,
                        title: 'Instant art drops',
                        description:
                            'Discover new AI-generated monster artwork instantly—each pack reveals unique robot creations.',
                    },
                    {
                        icon: <AutoAwesome />,
                        title: 'Robot-made art',
                        description:
                            'Every piece is unique AI-generated monster-style artwork—no two are alike.',
                    },
                    {
                        icon: <Palette />,
                        title: 'Curate galleries',
                        description:
                            'Build stunning art galleries of robot-created monster-inspired masterpieces.',
                    },
                    {
                        icon: <Share />,
                        title: 'Trade & showcase',
                        description:
                            'Share your favorite robot art and trade unique AI creations with other collectors.',
                    },
                ]}
            />

            {/* Collector testimonials replacing trust logos */}
            <CreatorSpotlights
                title="What art collectors say"
                items={[
                    {
                        byline: 'Riley M. • Streamer',
                        quote:
                            'I opened art packs on stream—chat was amazed by the unique robot-generated monster art!',
                        href: '/gallery',
                    },
                    {
                        byline: 'Sam K. • Card collector',
                        quote:
                            'The AI art is incredible—each piece feels like a unique monster masterpiece made by a robot!',
                        href: '/gallery',
                    },
                ]}
            />

            {/* Booster Pack Catalog */}
            <Box
                component="section"
                aria-labelledby="pack-catalog-heading"
                sx={{ py: 8, bgcolor: 'grey.50' }}
            >
                <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3 } }}>
                    <Stack spacing={2} sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography
                            id="pack-catalog-heading"
                            variant="h4"
                            component="h2"
                            sx={{ fontWeight: 800 }}
                        >
                            🎴 Browse Booster Packs
                        </Typography>
                    </Stack>

                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={activeTab}
                            onChange={(_, newValue) => {
                                setActiveTab(newValue);
                                // Reset pagination when switching to PlayMore packs tab
                                if (newValue === 1) {
                                    setSpecialPage(1);
                                }
                            }}
                            centered
                        >
                            <Tab label="Regular Packs" />
                            <Tab label="PlayMore Packs" />
                        </Tabs>
                    </Box>

                    {activeTab === 0 ? renderRegularPacks() : renderSpecialPacks()}
                </Box>
            </Box>

            {/* FAQ for collectors */}
            <FAQ
                title="Everything you need to know"
                items={[
                    {
                        q: 'How do I start collecting cards?',
                        a: "Start collecting in under 60 seconds! Simply sign up, get free credits, and open your first booster pack. Each pack contains unique AI-generated cards that you'll own permanently in your digital collection. No complex rules or learning curve required.",
                    },
                    {
                        q: 'What makes PlayMoreTCG cards special?',
                        a: 'Every card is completely unique, generated by advanced AI technology. Unlike traditional cards that have thousands of copies, each PlayMoreTCG card is one-of-a-kind artwork that belongs only to you. Plus, you can trade, showcase, and build themed collections with other collectors.',
                    },
                    {
                        q: "What's the value of collecting digital cards?",
                        a: 'Digital cards offer instant collection, no physical storage needs, and easy trading with collectors worldwide. Rare cards can appreciate in value, and your entire collection is searchable, displayable, and shareable instantly. Plus, you never lose or damage digital cards!',
                    },
                    {
                        q: 'What features do you offer collectors?',
                        a: 'Complete collection management: organized galleries, rarity tracking, trading systems, community sharing, and detailed card statistics. Join our 50,000+ collector community for trades, challenges, and showcasing your best finds.',
                    },
                ]}
            />

            {/* Final conversion block with dual CTAs */}
            <FinalCTA
                headline="Ready to collect robot-made monster art?"
                primary={{ label: 'Sign in to start collecting', href: '/signin' }}
                secondary={{ label: 'Open a free pack', href: '/booster' }}
            />
        </>
    );
};

export default Home;

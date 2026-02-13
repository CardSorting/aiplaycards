import { FC, useEffect, useState } from 'react';
import {
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardActionArea,
    Chip,
    Container,
    Fade,
    Grid,
    Grow,
    LinearProgress,
    Link as MUILink,
    Paper,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { SEO } from '@layout';
import { useSession } from '@hooks/useSession';

const MarketplaceHomePage: FC = () => {
    const { data: session } = useSession();
    const isMobile = useMediaQuery('(max-width:960px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    const [isLoading, setIsLoading] = useState(true);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalCards: 0,
        totalSold: 0,
        activeSellers: 0,
        happyBuyers: 0,
    });

    useEffect(() => {
        // Simulate loading and fetch stats
        const timer = setTimeout(() => {
            setStats({
                totalCards: 4324,
                totalSold: 1567,
                activeSellers: 89,
                happyBuyers: 1345,
            });
            setIsLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    const cardCategories = [
        {
            id: 'monster',
            title: 'Monster Cards',
            description: 'Discover and collect unique monster trading cards',
            image: '/assets/monster-category.png',
            color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            accentColor: '#667eea',
            href: '/marketplace/monster',
            icon: '⚡',
            stats: '1,234 cards',
            badge: 'Popular',
            badgeColor: '#4CAF50',
            trend: '+12%',
            isNew: false,
            isHot: true,
        },
        {
            id: 'duel',
            title: 'Duel Cards',
            description: 'Find powerful duel monsters, spells, and traps',
            image: '/assets/duel-category.png',
            color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            accentColor: '#f093fb',
            href: '/marketplace/duel',
            icon: '🔥',
            stats: '856 cards',
            badge: 'Trending',
            badgeColor: '#FF9800',
            trend: '+8%',
            isNew: false,
            isHot: true,
        },
        {
            id: 'spell',
            title: 'Spell Cards',
            description: 'Discover powerful spells, creatures, and artifacts',
            image: '/assets/spell-category.png',
            color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            accentColor: '#4facfe',
            href: '/marketplace/spell',
            icon: '⚔️',
            stats: '2,145 cards',
            badge: 'New',
            badgeColor: '#2196F3',
            trend: '+25%',
            isNew: true,
            isHot: false,
        },
        {
            id: 'special',
            title: 'Special Collection',
            description: 'Exclusive special cards from limited edition packs',
            image: '/assets/special-category.png',
            color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            accentColor: '#a8edea',
            href: '/marketplace/special',
            icon: '✨',
            stats: '89 cards',
            badge: 'Limited',
            badgeColor: '#9C27B0',
            trend: '+5%',
            isNew: false,
            isHot: false,
        },
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                position: 'relative',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                        'radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.1) 0%, transparent 50%)',
                    pointerEvents: 'none',
                },
            }}
        >
            <SEO title="Card Marketplace" description="Discover, collect, and trade unique cards from our vibrant community" />
            <Container
                maxWidth="xl"
                sx={{
                    py: { xs: 3, sm: 4, md: 6 },
                    px: { xs: 2, sm: 3 },
                    position: 'relative',
                    zIndex: 1,
                }}
            >
                {/* Header Section */}
                <Fade in timeout={800}>
                    <Stack spacing={{ xs: 2, sm: 3 }} sx={{ mb: { xs: 4, md: 6 } }}>
                        <Breadcrumbs
                            aria-label="breadcrumb"
                            sx={{
                                '& .MuiBreadcrumbs-separator': {
                                    color: 'text.secondary',
                                    fontSize: '1.2rem',
                                },
                            }}
                        >
                            <MUILink
                                component={Link}
                                to="/"
                                sx={{
                                    textDecoration: 'none',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    '&:hover': { color: 'primary.main' },
                                }}
                            >
                                Home
                            </MUILink>
                            <Typography color="text.primary" fontWeight={600}>
                                Marketplace
                            </Typography>
                        </Breadcrumbs>

                        <Box sx={{ textAlign: 'center', mb: 2 }}>
                            <Typography
                                variant={isSmallMobile ? 'h3' : 'h2'}
                                fontWeight={800}
                                sx={{
                                    mb: 2,
                                    background:
                                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                    fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
                                    lineHeight: 1.1,
                                }}
                            >
                                Card Marketplace
                            </Typography>
                            <Typography
                                variant="h6"
                                color="text.secondary"
                                sx={{
                                    maxWidth: 700,
                                    mx: 'auto',
                                    fontSize: { xs: '1.1rem', sm: '1.25rem' },
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                }}
                            >
                                Discover, collect, and trade unique cards from our vibrant
                                community
                            </Typography>

                            {/* Stats Preview */}
                            <Box
                                sx={{
                                    mt: 4,
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 3,
                                    flexWrap: 'wrap',
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 2 }} />
                                        <Skeleton variant="rounded" width={120} height={32} sx={{ borderRadius: 2 }} />
                                        <Skeleton variant="rounded" width={140} height={32} sx={{ borderRadius: 2 }} />
                                    </>
                                ) : (
                                    <>
                                        <Tooltip title="Total cards available in marketplace" arrow>
                                            <Chip
                                                label={`${stats.totalCards.toLocaleString()}+ Cards`}
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderColor: 'primary.main',
                                                    color: 'primary.main',
                                                    '& .MuiChip-label': { px: 2 },
                                                    '&:hover': { transform: 'scale(1.05)', backgroundColor: 'primary.main', color: 'white' },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Active sellers in the community" arrow>
                                            <Chip
                                                label={`${stats.activeSellers}+ Sellers`}
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderColor: 'secondary.main',
                                                    color: 'secondary.main',
                                                    '& .MuiChip-label': { px: 2 },
                                                    '&:hover': { transform: 'scale(1.05)', backgroundColor: 'secondary.main', color: 'white' },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        </Tooltip>
                                        <Tooltip title="Community engagement level" arrow>
                                            <Chip
                                                label="Active Community"
                                                variant="outlined"
                                                sx={{
                                                    fontWeight: 600,
                                                    borderColor: 'success.main',
                                                    color: 'success.main',
                                                    '& .MuiChip-label': { px: 2 },
                                                    '&:hover': { transform: 'scale(1.05)', backgroundColor: 'success.main', color: 'white' },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            />
                                        </Tooltip>
                                    </>
                                )}
                            </Box>
                        </Box>
                    </Stack>
                </Fade>

                {/* Category Cards */}
                <Grid container spacing={{ xs: 3, sm: 4, md: 5 }} justifyContent="center">
                    {cardCategories.map((category, index) => (
                        <Grid item xs={12} sm={6} lg={3} key={category.id}>
                            <Grow in timeout={1000 + index * 200}>
                                <Card
                                    elevation={0}
                                    onMouseEnter={() => setHoveredCard(category.id)}
                                    onMouseLeave={() => setHoveredCard(null)}
                                    sx={{
                                        height: '100%',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        borderRadius: 4,
                                        background: hoveredCard === category.id ? 'rgba(255, 255, 255, 0.35)' : 'rgba(255, 255, 255, 0.25)',
                                        backdropFilter: 'blur(10px)',
                                        border: hoveredCard === category.id ? '2px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.18)',
                                        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                        cursor: 'pointer',
                                        '&:hover': { transform: 'translateY(-12px)' },
                                    }}
                                >
                                    <CardActionArea component={Link} to={category.href} sx={{ height: '100%', p: 0 }}>
                                        <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: category.color, opacity: 0.1, zIndex: 1 }} />
                                        <Box sx={{ position: 'absolute', top: 12, right: 12, zIndex: 3 }}>
                                            <Chip label={category.badge} size="small" sx={{ backgroundColor: category.badgeColor, color: 'white', fontWeight: 700 }} />
                                        </Box>
                                        <Box sx={{ position: 'relative', zIndex: 2, height: { xs: 380, sm: 420 }, display: 'flex', flexDirection: 'column', p: 4 }}>
                                            <Box sx={{ textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                                <Typography variant="h3" sx={{ mb: 1.5 }}>{category.icon}</Typography>
                                                <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>{category.title}</Typography>
                                                <Typography variant="body1" sx={{ color: '#2a2a2a', fontWeight: 600 }}>{category.description}</Typography>
                                            </Box>
                                            <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                                                <Button variant="contained" size="large" sx={{ background: category.color, borderRadius: 3, textTransform: 'none' }}>Explore Collection</Button>
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grow>
                        </Grid>
                    ))}
                </Grid>

                {/* Stats Section */}
                <Fade in timeout={1200}>
                    <Paper elevation={0} sx={{ mt: 8, p: { xs: 4, sm: 6 }, textAlign: 'center', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(20px)', borderRadius: 4 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Marketplace Statistics</Typography>
                        <Grid container spacing={4} justifyContent="center" sx={{ mt: 3 }}>
                            {[
                                { label: 'Cards Listed', value: stats.totalCards.toLocaleString(), color: 'primary.main' },
                                { label: 'Cards Sold', value: stats.totalSold.toLocaleString(), color: 'success.main' },
                                { label: 'Active Sellers', value: stats.activeSellers, color: 'secondary.main' },
                                { label: 'Happy Buyers', value: stats.happyBuyers.toLocaleString(), color: 'warning.main' },
                            ].map((stat, i) => (
                                <Grid item xs={6} sm={3} key={i}>
                                    <Box sx={{ p: 3, borderRadius: 3, background: 'rgba(255, 255, 255, 0.5)', border: '1px solid rgba(0,0,0,0.05)' }}>
                                        <Typography variant="h3" fontWeight={800} color={stat.color}>{isLoading ? <Skeleton width={60} sx={{ mx: 'auto' }} /> : stat.value}</Typography>
                                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{stat.label}</Typography>
                                    </Box>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Fade>

                {/* Quick Actions */}
                {session?.user && (
                    <Fade in timeout={1400}>
                        <Paper elevation={0} sx={{ mt: 6, p: 5, background: 'rgba(255, 255, 255, 0.3)', backdropFilter: 'blur(15px)', borderRadius: 4 }}>
                            <Typography variant="h5" fontWeight={700} sx={{ mb: 4, textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', backgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Quick Actions</Typography>
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ maxWidth: 600, mx: 'auto' }}>
                                <Button component={Link} to="/marketplace/manage" variant="outlined" size="large" sx={{ flex: 1, borderRadius: 3, fontWeight: 600 }}>Manage My Listings</Button>
                                <Button component={Link} to="/marketplace/manage/create" variant="contained" size="large" sx={{ flex: 1, borderRadius: 3, fontWeight: 600, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>Create New Listing</Button>
                            </Stack>
                        </Paper>
                    </Fade>
                )}
            </Container>
        </Box>
    );
};

export default MarketplaceHomePage;

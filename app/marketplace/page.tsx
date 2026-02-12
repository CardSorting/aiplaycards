'use client';

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
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MarketplaceHomePage() {
  const { data: session } = useSession();
  const router = useRouter();
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
                href="/"
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
                    <Skeleton
                      variant="rounded"
                      width={120}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rounded"
                      width={120}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
                    <Skeleton
                      variant="rounded"
                      width={140}
                      height={32}
                      sx={{ borderRadius: 2 }}
                    />
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
                          '&:hover': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
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
                          '&:hover': {
                            backgroundColor: 'secondary.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
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
                          '&:hover': {
                            backgroundColor: 'success.main',
                            color: 'white',
                            transform: 'scale(1.05)',
                          },
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
        <Grid
          container
          spacing={{ xs: 3, sm: 4, md: 5 }}
          justifyContent="center"
        >
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
                    background:
                      hoveredCard === category.id
                        ? 'rgba(255, 255, 255, 0.35)'
                        : 'rgba(255, 255, 255, 0.25)',
                    backdropFilter: 'blur(10px)',
                    border:
                      hoveredCard === category.id
                        ? '2px solid rgba(255, 255, 255, 0.4)'
                        : '1px solid rgba(255, 255, 255, 0.18)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-12px) scale(1.02)',
                      boxShadow:
                        '0 20px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.3)',
                      '& .categoryIcon': {
                        transform: 'scale(1.2) rotate(5deg)',
                      },
                      '& .categoryButton': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.2)',
                      },
                      '& .categoryBadge': {
                        transform: 'scale(1.1)',
                      },
                    },
                  }}
                >
                  <CardActionArea
                    component={Link}
                    href={category.href}
                    sx={{ height: '100%', p: 0 }}
                  >
                    {/* Background Pattern */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: category.color,
                        opacity: 0.1,
                        zIndex: 1,
                      }}
                    />

                    {/* Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        zIndex: 3,
                      }}
                    >
                      <Chip
                        className="categoryBadge"
                        label={category.badge}
                        size="small"
                        sx={{
                          backgroundColor: category.badgeColor,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 24,
                          transition: 'all 0.3s ease',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                          '&:hover': {
                            backgroundColor: category.badgeColor,
                            filter: 'brightness(1.1)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    </Box>

                    {/* Trend Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 12,
                        left: 12,
                        zIndex: 3,
                      }}
                    >
                      <Chip
                        label={category.trend}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(0, 0, 0, 0.8)',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 24,
                          transition: 'all 0.3s ease',
                          textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)',
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                          '&:hover': {
                            backgroundColor: 'rgba(0, 0, 0, 0.9)',
                            transform: 'scale(1.05)',
                          },
                        }}
                      />
                    </Box>

                    {/* Content */}
                    <Box
                      sx={{
                        position: 'relative',
                        zIndex: 2,
                        height: { xs: 380, sm: 420, md: 460 },
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        p: 4,
                        color: 'text.primary',
                      }}
                    >
                      {/* Top Section */}
                      <Box
                        sx={{
                          textAlign: 'center',
                          position: 'relative',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center',
                        }}
                      >
                        {/* Hot/New Indicator */}
                        {(category.isHot || category.isNew) && (
                          <Box
                            sx={{
                              position: 'absolute',
                              top: -8,
                              left: '50%',
                              transform: 'translateX(-50%)',
                              zIndex: 1,
                            }}
                          >
                            <Chip
                              label={category.isNew ? 'NEW' : 'HOT'}
                              size="small"
                              sx={{
                                backgroundColor: category.isNew
                                  ? '#2196F3'
                                  : '#FF5722',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '0.7rem',
                                height: 20,
                                animation: category.isHot
                                  ? 'pulse 2s infinite'
                                  : 'none',
                                '@keyframes pulse': {
                                  '0%': { transform: 'scale(1)' },
                                  '50%': { transform: 'scale(1.05)' },
                                  '100%': { transform: 'scale(1)' },
                                },
                              }}
                            />
                          </Box>
                        )}

                        <Box
                          className="categoryIcon"
                          sx={{
                            fontSize: { xs: '2.5rem', sm: '3rem' },
                            mb: 1.5,
                            transition: 'all 0.3s ease',
                            display: 'block',
                            filter:
                              hoveredCard === category.id
                                ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                                : 'none',
                          }}
                        >
                          {category.icon}
                        </Box>

                        <Typography
                          variant="h5"
                          fontWeight={800}
                          sx={{
                            mb: 1.5,
                            fontSize: { xs: '1.3rem', sm: '1.5rem' },
                            color: '#1a1a1a',
                            textShadow:
                              '0 2px 4px rgba(255, 255, 255, 0.8), 0 1px 2px rgba(0, 0, 0, 0.3)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '6px 12px',
                            borderRadius: 3,
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {category.title}
                        </Typography>

                        <Typography
                          variant="body1"
                          sx={{
                            mb: 2,
                            lineHeight: 1.5,
                            fontSize: { xs: '0.9rem', sm: '0.95rem' },
                            color: '#2a2a2a',
                            fontWeight: 600,
                            textShadow: '0 1px 2px rgba(255, 255, 255, 0.8)',
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            padding: '8px 12px',
                            borderRadius: 3,
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(255, 255, 255, 0.5)',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                          }}
                        >
                          {category.description}
                        </Typography>
                      </Box>

                      {/* Bottom Section */}
                      <Box sx={{ textAlign: 'center', mt: 'auto' }}>
                        <Button
                          className="categoryButton"
                          variant="contained"
                          size="large"
                          sx={{
                            background: category.color,
                            color: 'white',
                            fontWeight: 700,
                            px: 3,
                            py: 1.2,
                            borderRadius: 3,
                            textTransform: 'none',
                            fontSize: '0.95rem',
                            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                            position: 'relative',
                            overflow: 'hidden',
                            textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                            border: '2px solid rgba(255, 255, 255, 0.2)',
                            minHeight: 44,
                            '&:hover': {
                              background: category.color,
                              filter: 'brightness(1.1)',
                              boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
                              '&::before': {
                                opacity: 1,
                                transform: 'translateX(0)',
                              },
                            },
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background:
                                'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                              transition: 'all 0.5s ease',
                              opacity: 0,
                              transform: 'translateX(-100%)',
                            },
                            transition: 'all 0.3s ease',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            Explore Collection
                            <Box
                              sx={{
                                fontSize: '0.9rem',
                                transition: 'transform 0.3s ease',
                                transform:
                                  hoveredCard === category.id
                                    ? 'translateX(4px)'
                                    : 'translateX(0)',
                                textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
                              }}
                            >
                              →
                            </Box>
                          </Box>
                        </Button>
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
          <Paper
            elevation={0}
            sx={{
              mt: 8,
              p: { xs: 4, sm: 6 },
              textAlign: 'center',
              background: 'rgba(255, 255, 255, 0.4)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: 4,
            }}
          >
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                mb: 1,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Marketplace Statistics
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Real-time data from our growing community
            </Typography>

            {isLoading ? (
              <Box sx={{ mb: 2 }}>
                <LinearProgress
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    '& .MuiLinearProgress-bar': {
                      background:
                        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  Loading marketplace data...
                </Typography>
              </Box>
            ) : null}

            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={6} sm={3}>
                <Tooltip title="Total cards available for purchase" arrow>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(102, 126, 234, 0.1)',
                      border: '1px solid rgba(102, 126, 234, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.15)',
                        background: 'rgba(102, 126, 234, 0.15)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={40}
                          sx={{ mx: 'auto', mb: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          sx={{ mx: 'auto' }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          color="primary.main"
                          sx={{ mb: 1 }}
                        >
                          {stats.totalCards.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Cards Listed
                        </Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Tooltip title="Successfully completed transactions" arrow>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(76, 175, 80, 0.1)',
                      border: '1px solid rgba(76, 175, 80, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(76, 175, 80, 0.15)',
                        background: 'rgba(76, 175, 80, 0.15)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={40}
                          sx={{ mx: 'auto', mb: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          sx={{ mx: 'auto' }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          color="success.main"
                          sx={{ mb: 1 }}
                        >
                          {stats.totalSold.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Cards Sold
                        </Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Tooltip title="Active marketplace participants" arrow>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(156, 39, 176, 0.1)',
                      border: '1px solid rgba(156, 39, 176, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(156, 39, 176, 0.15)',
                        background: 'rgba(156, 39, 176, 0.15)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={40}
                          sx={{ mx: 'auto', mb: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          sx={{ mx: 'auto' }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          color="secondary.main"
                          sx={{ mb: 1 }}
                        >
                          {stats.activeSellers}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Active Sellers
                        </Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Tooltip title="Satisfied customers" arrow>
                  <Box
                    sx={{
                      p: 3,
                      borderRadius: 3,
                      background: 'rgba(255, 152, 0, 0.1)',
                      border: '1px solid rgba(255, 152, 0, 0.2)',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 8px 25px rgba(255, 152, 0, 0.15)',
                        background: 'rgba(255, 152, 0, 0.15)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <>
                        <Skeleton
                          variant="text"
                          width="60%"
                          height={40}
                          sx={{ mx: 'auto', mb: 1 }}
                        />
                        <Skeleton
                          variant="text"
                          width="80%"
                          height={20}
                          sx={{ mx: 'auto' }}
                        />
                      </>
                    ) : (
                      <>
                        <Typography
                          variant="h3"
                          fontWeight={800}
                          color="warning.main"
                          sx={{ mb: 1 }}
                        >
                          {stats.happyBuyers.toLocaleString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight={600}
                        >
                          Happy Buyers
                        </Typography>
                      </>
                    )}
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </Paper>
        </Fade>

        {/* Quick Actions */}
        {session?.user && (
          <Fade in timeout={1400}>
            <Paper
              elevation={0}
              sx={{
                mt: 6,
                p: { xs: 4, sm: 5 },
                background: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(15px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: 4,
              }}
            >
              <Typography
                variant="h5"
                fontWeight={700}
                sx={{
                  mb: 1,
                  textAlign: 'center',
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Quick Actions
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 4, textAlign: 'center' }}
              >
                Manage your marketplace presence
              </Typography>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                sx={{ maxWidth: 600, mx: 'auto' }}
              >
                <Button
                  component={Link}
                  href="/marketplace/manage"
                  variant="outlined"
                  size="large"
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: 3,
                    borderWidth: 2,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Manage My Listings
                </Button>

                <Button
                  component={Link}
                  href="/marketplace/manage/create"
                  variant="contained"
                  size="large"
                  sx={{
                    flex: 1,
                    py: 2,
                    borderRadius: 3,
                    fontWeight: 600,
                    fontSize: '1rem',
                    textTransform: 'none',
                    background:
                      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)',
                    '&:hover': {
                      background:
                        'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Create New Listing
                </Button>
              </Stack>
            </Paper>
          </Fade>
        )}
      </Container>
    </Box>
  );
}

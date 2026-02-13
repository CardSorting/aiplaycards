'use client';
import { useSession } from 'next-auth/react';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogContent,
  Fade,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Skeleton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  FavoriteOutlined as FavoriteIcon,
  Fullscreen as FullscreenIcon,
  GroupWork as GroupWorkIcon,
  Info as InfoIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PhotoLibrary as PhotoLibraryIcon,
  PlayArrow as PlayArrowIcon,
  Print as PrintIcon,
  Public as PublicIcon,
  Schedule as ScheduleIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { SEO } from '@layout';
import Link from 'next/link';
import {
  CardData,
  CardDisplayWrapper,
  normalizeCardData,
} from '@components/CardDisplayWrapper';
import { cardImgHeight, cardImgWidth } from '@cardEditor/cardStyles';
import { InsufficientCreditsDialog } from '@components/InsufficientCreditsDialog';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface UserCard extends CardData {
  isPublic: boolean;
  cardNumber?: string;
  totalInSet?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
  pregenerated?: boolean;
}

const CardDetailPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const cardId = params?.id as string;

  const [card, setCard] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [animationJobId, setAnimationJobId] = useState<number | null>(null);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);
  const [showInsufficientCreditsDialog, setShowInsufficientCreditsDialog] =
    useState(false);
  const [insufficientCreditsInfo, setInsufficientCreditsInfo] = useState<{
    required: number;
    available: number;
  } | null>(null);
  const [animationCompleted, setAnimationCompleted] = useState(false);
  const [showAnimationSuccess, setShowAnimationSuccess] = useState(false);

  // Fetch user credits when component mounts
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/credits');
          if (response.ok) {
            const data = await response.json();
            setUserCredits(data.credits);
          }
        } catch (error) {
          console.error('Failed to fetch user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [user?.id]);

  useEffect(() => {
    const fetchCard = async () => {
      if (!cardId) {
        setError('Card ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/cards/${cardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Card not found');
          } else {
            setError('Failed to fetch card');
          }
          return;
        }

        const data = await response.json();

        // Normalize the card data using the shared utility
        const normalizedCard = {
          ...normalizeCardData(data.data),
          isPublic: data.data.isPublic,
          cardNumber: data.data.cardNumber,
          totalInSet: data.data.totalInSet,
          createdAt: data.data.createdAt,
          updatedAt: data.data.updatedAt,
          userId: data.data.userId,
          animationUrl: data.data.animationUrl,
          animationKey: data.data.animationKey,
          animationPrompt: data.data.animationPrompt,
          animatedAt: data.data.animatedAt,
        };

        setCard(normalizedCard);

        // If card already has animation, mark as completed to hide button
        if (normalizedCard.animationUrl) {
          setAnimationCompleted(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load card');
      } finally {
        setLoading(false);
      }
    };

    fetchCard();
  }, [cardId]);

  const getPrimaryImageUrl = (): string | undefined => {
    if (!card) return undefined;
    return (
      card.imageData?.dataUrl ||
      (Array.isArray(card.imageData?.generated) &&
        card.imageData!.generated![0]) ||
      undefined
    );
  };

  const getThumbImageUrl = (): string | undefined => {
    if (!card) return undefined;
    return (
      (Array.isArray(card.imageData?.thumbs) && card.imageData!.thumbs![0]) ||
      undefined
    );
  };

  const handleShare = () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';
    const cardUrl = `${siteUrl}/gallery/${cardId}`;
    const primaryImage = getPrimaryImageUrl();

    if (navigator.share && primaryImage) {
      fetch(primaryImage)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${card?.name || 'Card'}.png`, {
            type: 'image/png',
          });
          navigator.share({
            title: `Check out my ${card?.name} card!`,
            text: `I created this ${card?.name} trading card using PlayMore TCG`,
            files: [file],
          });
        })
        .catch(err => {
          console.error('Sharing failed:', err);
          // Fallback to URL sharing
          if (navigator.share) {
            navigator.share({
              title: `${card?.name} Trading Card`,
              text: `Check out my ${card?.name} Trading card created with PlayMore TCG!`,
              url: cardUrl,
            });
          }
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(cardUrl);
      alert('Card link copied to clipboard!');
    }
  };

  const handleCopyEmbed = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';
    const pageUrl = `${siteUrl}/gallery/${cardId}`;
    const oembed = `${siteUrl}/api/oembed?url=${encodeURIComponent(pageUrl)}`;
    const iframe = `<iframe src="${siteUrl}/embed/card/${card?.id}" width="420" height="680" frameborder="0" allowfullscreen loading="lazy" style="max-width:100%;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);"></iframe>`;
    try {
      await navigator.clipboard?.writeText(iframe);
      alert('Embed code copied to clipboard!');
    } catch {
      try {
        await navigator.clipboard?.writeText(oembed);
        alert('oEmbed link copied to clipboard!');
      } catch {}
    }
  };

  const handleFullscreenOpen = useCallback(() => {
    setFullscreenOpen(true);
    setZoomLevel(1);
  }, []);

  const handleFullscreenClose = useCallback(() => {
    setFullscreenOpen(false);
    setZoomLevel(1);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const getCardTypeColor = useCallback((type: string) => {
    const typeColors: Record<string, string> = {
      Fire: '#FF4444',
      Water: '#4488FF',
      Grass: '#44AA44',
      Electric: '#FFCC00',
      Lightning: '#FFCC00',
      Psychic: '#AA44AA',
      Fighting: '#CC6644',
      Darkness: '#444444',
      Dark: '#444444',
      Metal: '#888888',
      Dragon: '#7744AA',
      Fairy: '#FF88CC',
      Colorless: '#888888',
    };
    return typeColors[type] || '#888888';
  }, []);

  const getTypeGradient = useCallback(
    (type: string) => {
      const color = getCardTypeColor(type);
      return `linear-gradient(135deg, ${color}22, ${color}08)`;
    },
    [getCardTypeColor],
  );

  const isOwner = user?.id === card?.userId;

  // Print order handler - redirect to checkout page
  const handlePrintOrderOpen = useCallback(() => {
    if (card) {
      router.push(`/checkout/print/${card.id}`);
    }
  }, [card, router]);

  const handleAnimate = useCallback(async () => {
    if (!card || !getPrimaryImageUrl()) return;

    setCreditError(null);
    setAnimating(true);
    setAnimationCompleted(false);
    setShowAnimationSuccess(false);

    try {
      const response = await fetch('/api/animate-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardId: cardId,
          imageUrl: getPrimaryImageUrl(),
          cardData: {
            name: card.name,
            type: card.type,
            supertype: card.supertype,
            subtype: card.subtype,
            dexStats: card.dexStats,
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Credit-related error - show the insufficient credits dialog
          if (result.required && result.available !== undefined) {
            setInsufficientCreditsInfo({
              required: result.required,
              available: result.available,
            });
            setShowInsufficientCreditsDialog(true);
          } else {
            setCreditError(
              result.message ||
                result.error ||
                'Insufficient credits for animation generation',
            );
          }
          setAnimating(false);
          return;
        } else if (response.status === 401) {
          setCreditError('Please sign in to generate animations');
          setAnimating(false);
          return;
        } else {
          throw new Error(result.error || 'Failed to queue animation job');
        }
      }

      if (result.success && result.jobId) {
        setAnimationJobId(result.jobId);
        // Update user credits after successful job creation
        if (userCredits !== null) {
          setUserCredits(userCredits - 4);
        }
        // Start polling for job completion
        pollForAnimationCompletion(result.jobId);
      } else {
        throw new Error(result.message || 'Failed to queue animation job');
      }
    } catch (error) {
      console.error('Animation failed:', error);
      setCreditError(
        error instanceof Error
          ? error.message
          : 'Failed to start animation generation. Please try again.',
      );
      setAnimating(false);
    }
  }, [card, cardId, getPrimaryImageUrl, userCredits]);

  const pollForAnimationCompletion = useCallback(
    async (jobId: number) => {
      const maxPolls = 60; // 5 minutes with 5-second intervals
      let pollCount = 0;

      const poll = async () => {
        try {
          const response = await fetch(`/api/animation-jobs/${jobId}/status`);

          if (!response.ok) {
            throw new Error('Failed to get job status');
          }

          const result = await response.json();

          if (result.success && result.job) {
            const job = result.job;

            if (job.status === 'complete') {
              console.log('Animation job completed successfully');
              setAnimating(false);
              setAnimationJobId(null);
              setCreditError(null); // Clear any previous errors

              // Refresh card data to get the new animation URL
              const cardResponse = await fetch(`/api/cards/${cardId}`);
              if (cardResponse.ok) {
                const cardData = await cardResponse.json();
                const normalizedCard = {
                  ...normalizeCardData(cardData.data),
                  isPublic: cardData.data.isPublic,
                  cardNumber: cardData.data.cardNumber,
                  totalInSet: cardData.data.totalInSet,
                  createdAt: cardData.data.createdAt,
                  updatedAt: cardData.data.updatedAt,
                  userId: cardData.data.userId,
                  animationUrl: cardData.data.animationUrl,
                  animationKey: cardData.data.animationKey,
                  animationPrompt: cardData.data.animationPrompt,
                  animatedAt: cardData.data.animatedAt,
                };
                setCard(normalizedCard);

                // Show success message and mark as completed
                setAnimationCompleted(true);
                setShowAnimationSuccess(true);

                // Auto-hide success message after 5 seconds
                setTimeout(() => {
                  setShowAnimationSuccess(false);
                }, 5000);
              }

              return;
            } else if (job.status === 'failed') {
              console.error('Animation job failed:', job.error);
              setAnimating(false);
              setAnimationJobId(null);
              setCreditError(
                `Animation generation failed: ${job.error || 'Unknown error'}`,
              );
              return;
            }

            // Job is still processing, continue polling
            if (pollCount < maxPolls) {
              pollCount++;
              setTimeout(poll, 5000); // Poll every 5 seconds
            } else {
              console.error('Animation job polling timed out');
              setAnimating(false);
              setAnimationJobId(null);
              setCreditError(
                'Animation generation is taking longer than expected. Please check back later.',
              );
            }
          } else {
            throw new Error('Invalid job status response');
          }
        } catch (error) {
          console.error('Failed to poll job status:', error);
          setAnimating(false);
          setAnimationJobId(null);
          setCreditError(
            'Failed to check animation progress. Please try again.',
          );
        }
      };

      // Start polling
      setTimeout(poll, 2000); // First poll after 2 seconds
    },
    [cardId],
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading card...
          </Typography>
        </Stack>
      </Container>
    );
  }

  if (error || !card) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error || 'Card not found'}
        </Alert>
        <Button component={Link} href="/gallery" variant="outlined">
          Back to My Collection
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${card.name} - Trading Card Collection`}
        description={`Explore ${card.name}, a custom ${card.type}-type Trading card with ${card.hitpoints} HP. Created with PlayMore TCG.`}
      />

      {/* Hero Section */}
      <Box
        sx={{
          background: getTypeGradient(card.type),
          borderBottom: `2px solid ${getCardTypeColor(card.type)}40`,
          pb: 2,
          pt: 1,
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ py: 2 }}
          >
            <Button
              component={Link}
              href="/gallery"
              variant="text"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: `${getCardTypeColor(card.type)}20`,
                },
              }}
            >
              Back to My Collection
            </Button>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={card.isPublic ? <PublicIcon /> : <LockIcon />}
                label={card.isPublic ? 'Public' : 'Private'}
                size="small"
                color={card.isPublic ? 'success' : 'default'}
                variant="filled"
              />

              <Tooltip title="View Fullscreen">
                <IconButton
                  onClick={handleFullscreenOpen}
                  disabled={!getPrimaryImageUrl()}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getCardTypeColor(card.type)}20`,
                    },
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Copy Embed">
                <IconButton
                  onClick={handleCopyEmbed}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getCardTypeColor(card.type)}20`,
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Share Card">
                <IconButton
                  onClick={handleShare}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getCardTypeColor(card.type)}20`,
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Card Title and Metadata */}
          <Box sx={{ pb: 2 }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              alignItems={{ xs: 'flex-start', md: 'flex-end' }}
              spacing={2}
              sx={{ mb: 2 }}
            >
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="h2"
                  component="h1"
                  sx={{
                    fontWeight: 800,
                    mb: 1,
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    textShadow: `2px 2px 4px ${getCardTypeColor(card.type)}40`,
                  }}
                >
                  {card.name}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 2 }}
                >
                  <Chip
                    label={card.supertype}
                    size="medium"
                    sx={{
                      backgroundColor: `${getCardTypeColor(card.type)}40`,
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={card.type}
                    size="medium"
                    sx={{
                      backgroundColor: getCardTypeColor(card.type),
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                  {card.subtype && (
                    <Chip
                      label={card.subtype}
                      size="medium"
                      variant="outlined"
                      sx={{ borderColor: `${getCardTypeColor(card.type)}80` }}
                    />
                  )}
                  {card.rarity && (
                    <Chip
                      label={card.rarity}
                      size="medium"
                      color="warning"
                      variant="filled"
                    />
                  )}
                </Stack>
              </Box>

              {card.hitpoints && (
                <Box
                  sx={{
                    backgroundColor: `${getCardTypeColor(card.type)}20`,
                    border: `2px solid ${getCardTypeColor(card.type)}80`,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 120,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="h3"
                    component="div"
                    sx={{ fontWeight: 800, color: getCardTypeColor(card.type) }}
                  >
                    {card.hitpoints}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600 }}
                  >
                    Hit Points
                  </Typography>
                </Box>
              )}
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              alignItems="center"
              flexWrap="wrap"
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <ScheduleIcon color="action" />
                <Typography variant="body2" color="text.secondary">
                  Created{' '}
                  {new Date(card.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Stack>

              {card.illustrator && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PersonIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    Illustrated by {card.illustrator}
                  </Typography>
                </Stack>
              )}

              {card.cardNumber && card.totalInSet && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <PhotoLibraryIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    #{card.cardNumber} of {card.totalInSet}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Card Display */}
          <Grid item xs={12} lg={8}>
            <Paper
              elevation={8}
              sx={{
                p: { xs: 2, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(145deg, #fafafa 0%, #f0f0f0 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${getCardTypeColor(
                    card.type,
                  )}, ${getCardTypeColor(card.type)}80)`,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <VisibilityIcon color="primary" />
                  Card Preview
                </Typography>

                <Stack direction="row" spacing={1}>
                  <Tooltip title="Toggle Details">
                    <IconButton
                      onClick={() => setShowDetails(!showDetails)}
                      size="small"
                    >
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Fullscreen View">
                    <IconButton
                      onClick={handleFullscreenOpen}
                      size="small"
                      disabled={!getPrimaryImageUrl()}
                    >
                      <FullscreenIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: { xs: 400, md: 600 },
                  position: 'relative',
                }}
              >
                {!imageLoaded && getPrimaryImageUrl() && (
                  <Skeleton
                    variant="rectangular"
                    width="80%"
                    height="100%"
                    sx={{
                      borderRadius: 3,
                      position: 'absolute',
                    }}
                  />
                )}

                <Zoom in={true} timeout={600}>
                  <Box
                    sx={{
                      width: { xs: '100%', sm: '80%', md: '70%' },
                      maxWidth: 500,
                      aspectRatio: `${cardImgWidth}/${cardImgHeight}`,
                      position: 'relative',
                    }}
                  >
                    {card && (
                      <div
                        onClick={handleFullscreenOpen}
                        style={{ cursor: 'pointer' }}
                      >
                        <CardDisplayWrapper
                          card={card}
                          showFrame={true}
                          disableParallax={false}
                          width="responsive"
                        />
                      </div>
                    )}
                    {!card && getPrimaryImageUrl() && (
                      <picture>
                        <source
                          type="image/webp"
                          srcSet={`${
                            getThumbImageUrl() || getPrimaryImageUrl()
                          } 480w, ${getPrimaryImageUrl()} 800w`}
                          sizes="(max-width: 600px) 80vw, 500px"
                        />
                        <img
                          src={getPrimaryImageUrl()!}
                          alt="Card"
                          onLoad={handleImageLoad}
                          onClick={handleFullscreenOpen}
                          decoding="async"
                          fetchPriority="high"
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: '12px',
                            boxShadow: `0 20px 40px #88888830, 0 8px 16px rgba(0,0,0,0.15)`,
                            objectFit: 'contain',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform =
                              'scale(1.02) translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 25px 50px #88888840, 0 12px 20px rgba(0,0,0,0.2)`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = '';
                            e.currentTarget.style.boxShadow = `0 20px 40px #88888830, 0 8px 16px rgba(0,0,0,0.15)`;
                          }}
                        />
                      </picture>
                    )}
                    {!card && !getPrimaryImageUrl() && (
                      <Box
                        sx={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#f0f0f0',
                          borderRadius: 3,
                          color: 'text.secondary',
                          border: '2px dashed #ddd',
                        }}
                      >
                        <PhotoLibraryIcon
                          sx={{ fontSize: 48, mb: 2, opacity: 0.5 }}
                        />
                        <Typography variant="h6">Card not available</Typography>
                        <Typography variant="body2" color="text.secondary">
                          The card image could not be loaded
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Zoom>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar with Card Information */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Quick Actions */}
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ mb: 2, fontWeight: 700 }}
                >
                  Quick Actions
                </Typography>
                <Stack spacing={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    startIcon={<ShareIcon />}
                    onClick={handleShare}
                    sx={{
                      backgroundColor: getCardTypeColor(card.type),
                      '&:hover': {
                        backgroundColor: `${getCardTypeColor(card.type)}DD`,
                      },
                    }}
                  >
                    Share Card
                  </Button>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    startIcon={<PrintIcon />}
                    onClick={handlePrintOrderOpen}
                    disabled={!user}
                  >
                    Order Physical Print
                  </Button>

                  <Stack spacing={1}>
                    {!card.animationUrl && !animationCompleted && isOwner && (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        startIcon={
                          animating ? (
                            <CircularProgress size={20} />
                          ) : (
                            <PlayArrowIcon />
                          )
                        }
                        onClick={handleAnimate}
                        disabled={
                          animating ||
                          !getPrimaryImageUrl() ||
                          (userCredits !== null && userCredits < 4)
                        }
                        sx={{
                          borderColor: getCardTypeColor(card.type),
                          color: getCardTypeColor(card.type),
                          '&:hover': {
                            borderColor: getCardTypeColor(card.type),
                            backgroundColor: `${getCardTypeColor(card.type)}10`,
                          },
                        }}
                      >
                        {animating
                          ? animationJobId
                            ? 'Processing...'
                            : 'Queuing...'
                          : 'Animate (25 credits)'}
                      </Button>
                    )}

                    {/* Credit status and error display */}
                    {user && (
                      <Box sx={{ textAlign: 'center' }}>
                        {userCredits !== null && (
                          <Typography variant="caption" color="text.secondary">
                            Your credits: {userCredits}
                          </Typography>
                        )}
                        {creditError && (
                          <Alert
                            severity="warning"
                            sx={{ mt: 1, fontSize: '0.875rem' }}
                          >
                            {creditError}
                            {userCredits !== null && userCredits < 4 && (
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  component={Link}
                                  href="/credits"
                                  size="small"
                                  variant="text"
                                  color="inherit"
                                >
                                  Get more credits
                                </Button>
                              </Box>
                            )}
                          </Alert>
                        )}
                      </Box>
                    )}

                    {/* Animation completion success message */}
                    {showAnimationSuccess && (
                      <Alert
                        severity="success"
                        sx={{
                          mt: 1,
                          animation: 'fadeIn 0.5s ease-in',
                        }}
                        onClose={() => setShowAnimationSuccess(false)}
                      >
                        🎉 Animation completed successfully! Your card is now
                        animated.
                      </Alert>
                    )}
                  </Stack>

                  {isOwner && !card.pregenerated && (
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      startIcon={<GroupWorkIcon />}
                      onClick={async () => {
                        if (
                          window.confirm(
                            `Submit "${card.name}" to the community pool? This will make your card available for others to collect.`,
                          )
                        ) {
                          try {
                            const response = await fetch(
                              '/api/community/submit-card',
                              {
                                method: 'POST',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({ cardId: card.id }),
                              },
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              throw new Error(
                                data.error || 'Failed to submit card',
                              );
                            }

                            alert(
                              `Successfully submitted "${card.name}" to the community pool!`,
                            );
                            // Refresh the page to update the card state
                            window.location.reload();
                          } catch (err) {
                            alert(
                              err instanceof Error
                                ? err.message
                                : 'Failed to submit card',
                            );
                          }
                        }
                      }}
                      sx={{
                        borderColor: '#10b981',
                        color: '#10b981',
                        '&:hover': {
                          borderColor: '#059669',
                          backgroundColor: '#10b98110',
                        },
                      }}
                    >
                      Submit to Community
                    </Button>
                  )}

                  {isOwner && (
                    <Button
                      component={Link}
                      href="/marketplace/manage/create"
                      fullWidth
                      variant="contained"
                      size="large"
                    >
                      Create Listing
                    </Button>
                  )}
                </Stack>
              </Paper>

              {/* Card Statistics */}
              <Fade in={showDetails}>
                <Paper sx={{ p: 3, borderRadius: 3 }}>
                  <Typography
                    variant="h6"
                    gutterBottom
                    sx={{ mb: 2, fontWeight: 700 }}
                  >
                    Card Information
                  </Typography>

                  <List dense>
                    <ListItem>
                      <ListItemIcon>
                        <InfoIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Type"
                        secondary={
                          <Box
                            component="span"
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                backgroundColor: getCardTypeColor(card.type),
                              }}
                            />
                            <Box component="span">{card.type}</Box>
                          </Box>
                        }
                      />
                    </ListItem>

                    {card.hitpoints && (
                      <ListItem>
                        <ListItemIcon>
                          <FavoriteIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Hit Points"
                          secondary={`${card.hitpoints} HP`}
                        />
                      </ListItem>
                    )}

                    <ListItem>
                      <ListItemIcon>
                        <ScheduleIcon color="action" />
                      </ListItemIcon>
                      <ListItemText
                        primary="Created"
                        secondary={new Date(card.createdAt).toLocaleDateString(
                          'en-US',
                          {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          },
                        )}
                      />
                    </ListItem>

                    {card.illustrator && (
                      <ListItem>
                        <ListItemIcon>
                          <PersonIcon color="action" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Illustrator"
                          secondary={card.illustrator}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>
              </Fade>

              {/* Pokedex Info */}
              {card.dexStats && (
                <Fade in={showDetails}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ mb: 2, fontWeight: 700 }}
                    >
                      Pokédex Information
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2, fontFamily: 'monospace' }}
                    >
                      {card.dexStats}
                    </Typography>
                  </Paper>
                </Fade>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={fullscreenOpen}
        onClose={handleFullscreenClose}
        TransitionComponent={Transition}
        sx={{
          '& .MuiDialog-paper': {
            backgroundColor: 'rgba(0, 0, 0, 0.95)',
          },
        }}
      >
        <AppBar
          sx={{
            position: 'relative',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
          }}
        >
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleFullscreenClose}
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {card.name} - Fullscreen View
            </Typography>
            <Stack direction="row" spacing={1}>
              <IconButton
                color="inherit"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
              >
                <ZoomOutIcon />
              </IconButton>
              <Typography
                variant="body2"
                sx={{ display: 'flex', alignItems: 'center', px: 1 }}
              >
                {Math.round(zoomLevel * 100)}%
              </Typography>
              <IconButton
                color="inherit"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
              >
                <ZoomInIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 2,
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s ease',
              cursor: zoomLevel > 1 ? 'grab' : 'default',
              maxWidth: '100%',
              maxHeight: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {card && (
              <div style={{ transform: 'scale(1.5)' }}>
                <CardDisplayWrapper
                  card={card}
                  showFrame={true}
                  disableParallax={true}
                  width="responsive"
                />
              </div>
            )}
            {!card && getPrimaryImageUrl() && (
              <picture>
                <source
                  type="image/webp"
                  srcSet={`${
                    getThumbImageUrl() || getPrimaryImageUrl()
                  } 600w, ${getPrimaryImageUrl()} 1200w`}
                  sizes="(max-width: 900px) 90vw, 1200px"
                />
                <img
                  src={getPrimaryImageUrl()!}
                  alt="Card"
                  decoding="async"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </picture>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Insufficient Credits Dialog */}
      {insufficientCreditsInfo && (
        <InsufficientCreditsDialog
          open={showInsufficientCreditsDialog}
          onClose={() => {
            setShowInsufficientCreditsDialog(false);
            setInsufficientCreditsInfo(null);
          }}
          required={insufficientCreditsInfo.required}
          available={insufficientCreditsInfo.available}
          feature="card animation"
          action="animate"
        />
      )}
    </>
  );
};

export default CardDetailPage;

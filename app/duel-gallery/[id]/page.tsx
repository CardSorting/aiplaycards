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
  Info as InfoIcon,
  Lock as LockIcon,
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
import { YugiohCardDisplayWrapper } from '@components/CardDisplayWrapper';
import { YugiohCardData } from '@features/yugiohEditor/types';
import { InsufficientCreditsDialog } from '@components/InsufficientCreditsDialog';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface UserYugiohCard extends YugiohCardData {
  id: number;
  name: string;
  isPublic: boolean;
  cardNumber?: string;
  totalInSet?: string;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  attribute?: string;
  level?: number;
  rank?: number;
  atk?: number;
  def?: number;
  description?: string;
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
}

const YugiohCardDetailPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const cardId = params?.id as string;

  const [card, setCard] = useState<UserYugiohCard | null>(null);
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
        const response = await fetch(`/api/yugioh-cards/${cardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Card not found');
          } else {
            setError('Failed to fetch card');
          }
          return;
        }

        const data = await response.json();
        const yugiohCard = {
          ...data.data,
          animationUrl: data.data.animationUrl,
          animationKey: data.data.animationKey,
          animationPrompt: data.data.animationPrompt,
          animatedAt: data.data.animatedAt,
        };

        setCard(yugiohCard);

        // If card already has animation, mark as completed to hide button
        if (yugiohCard.animationUrl) {
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
    // For Yu-Gi-Oh cards, check for direct image URL or other available image fields
    return (
      (card as any).imageData?.dataUrl ||
      (Array.isArray((card as any).imageData?.generated) &&
        (card as any).imageData!.generated![0]) ||
      (card as any).image ||
      undefined
    );
  };

  const handleShare = () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';
    const cardUrl = `${siteUrl}/duel-gallery/${cardId}`;

    if (navigator.share) {
      navigator.share({
        title: `Check out my ${card?.name} duel card!`,
        text: `I created this ${card?.name} duel card using PlayMore TCG`,
        url: cardUrl,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(cardUrl);
      alert('Card link copied to clipboard!');
    }
  };

  const handleCopyEmbed = async () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';
    const pageUrl = `${siteUrl}/duel-gallery/${cardId}`;
    const oembed = `${siteUrl}/api/oembed?url=${encodeURIComponent(pageUrl)}`;
    const iframe = `<iframe src="${siteUrl}/embed/duel-card/${card?.id}" width="420" height="680" frameborder="0" allowfullscreen loading="lazy" style="max-width:100%;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);"></iframe>`;
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

  const getCardTypeColor = useCallback((cardType: string) => {
    const typeColors: Record<string, string> = {
      Normal: '#FEB941',
      Effect: '#FF8B53',
      Ritual: '#9DB5CC',
      Fusion: '#A686CF',
      Synchro: '#CCCCCC',
      Xyz: '#000000',
      Pendulum: '#15A36B',
      Link: '#00B4D8',
      Spell: '#1D9A6C',
      Trap: '#BC4A9B',
    };
    return typeColors[cardType] || '#FEB941';
  }, []);

  const getTypeGradient = useCallback(
    (cardType: string) => {
      const color = getCardTypeColor(cardType);
      return `linear-gradient(135deg, ${color}22, ${color}08)`;
    },
    [getCardTypeColor],
  );

  const isOwner = user?.id === card?.userId;

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
            type: card.cardType,
            supertype: 'Yu-Gi-Oh',
            subtype: card.cardSubtype,
            description: card.description,
            attribute: card.attribute,
            level: card.level,
            rank: card.rank,
            atk: card.atk,
            def: card.def,
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
          setUserCredits(userCredits - 25);
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
              const cardResponse = await fetch(`/api/yugioh-cards/${cardId}`);
              if (cardResponse.ok) {
                const cardData = await cardResponse.json();
                const yugiohCard = {
                  ...cardData.data,
                  animationUrl: cardData.data.animationUrl,
                  animationKey: cardData.data.animationKey,
                  animationPrompt: cardData.data.animationPrompt,
                  animatedAt: cardData.data.animatedAt,
                };
                setCard(yugiohCard);

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

  const handlePrintOrderOpen = useCallback(() => {
    if (card) {
      router.push(`/checkout/print/yugioh/${card.id}`);
    }
  }, [card, router]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading duel card...
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
        <Button component={Link} href="/duel-gallery" variant="outlined">
          Back to Duel Gallery
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${card.name} - Duel Card Collection`}
        description={`Explore ${card.name}, a custom ${
          card.cardType
        } duel card${card.atk !== undefined ? ` with ${card.atk} ATK` : ''}${
          card.def !== undefined ? ` and ${card.def} DEF` : ''
        }. Created with PlayMore TCG.`}
      />

      {/* Hero Section */}
      <Box
        sx={{
          background: getTypeGradient(card.cardType || 'Normal'),
          borderBottom: `2px solid ${getCardTypeColor(
            card.cardType || 'Normal',
          )}40`,
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
              href="/duel-gallery"
              variant="text"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: `${getCardTypeColor(
                    card.cardType || 'Normal',
                  )}20`,
                },
              }}
            >
              Back to Duel Gallery
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
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getCardTypeColor(
                        card.cardType || 'Normal',
                      )}20`,
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
                      backgroundColor: `${getCardTypeColor(
                        card.cardType || 'Normal',
                      )}20`,
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
                      backgroundColor: `${getCardTypeColor(
                        card.cardType || 'Normal',
                      )}20`,
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
                    textShadow: `2px 2px 4px ${getCardTypeColor(
                      card.cardType || 'Normal',
                    )}40`,
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
                  {card.cardType && (
                    <Chip
                      label={card.cardType}
                      size="medium"
                      sx={{
                        backgroundColor: getCardTypeColor(card.cardType),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {card.attribute && (
                    <Chip
                      label={card.attribute}
                      size="medium"
                      sx={{
                        backgroundColor: `${getCardTypeColor(
                          card.cardType || 'Normal',
                        )}40`,
                        color: 'text.primary',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {card.level !== undefined && (
                    <Chip
                      label={`Level ${card.level}`}
                      size="medium"
                      variant="outlined"
                      sx={{
                        borderColor: `${getCardTypeColor(
                          card.cardType || 'Normal',
                        )}80`,
                      }}
                    />
                  )}
                  {card.rank !== undefined && (
                    <Chip
                      label={`Rank ${card.rank}`}
                      size="medium"
                      variant="outlined"
                      sx={{
                        borderColor: `${getCardTypeColor(
                          card.cardType || 'Normal',
                        )}80`,
                      }}
                    />
                  )}
                </Stack>
              </Box>

              {(card.atk !== undefined || card.def !== undefined) && (
                <Box
                  sx={{
                    backgroundColor: `${getCardTypeColor(
                      card.cardType || 'Normal',
                    )}20`,
                    border: `2px solid ${getCardTypeColor(
                      card.cardType || 'Normal',
                    )}80`,
                    borderRadius: 2,
                    p: 2,
                    minWidth: 120,
                    textAlign: 'center',
                  }}
                >
                  {card.atk !== undefined && (
                    <>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          fontWeight: 800,
                          color: getCardTypeColor(card.cardType || 'Normal'),
                        }}
                      >
                        {card.atk}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        ATK
                      </Typography>
                    </>
                  )}
                  {card.def !== undefined && (
                    <>
                      <Typography
                        variant="h4"
                        component="div"
                        sx={{
                          fontWeight: 800,
                          color: getCardTypeColor(card.cardType || 'Normal'),
                          mt: 1,
                        }}
                      >
                        {card.def}
                      </Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ fontWeight: 600 }}
                      >
                        DEF
                      </Typography>
                    </>
                  )}
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
                    card.cardType || 'Normal',
                  )}, ${getCardTypeColor(card.cardType || 'Normal')}80)`,
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
                  Duel Card Preview
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
                    <IconButton onClick={handleFullscreenOpen} size="small">
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
                <Zoom in={true} timeout={600}>
                  <Box
                    sx={{
                      width: { xs: '100%', sm: '80%', md: '70%' },
                      maxWidth: 500,
                      aspectRatio: '59/86',
                      position: 'relative',
                    }}
                  >
                    <div
                      onClick={handleFullscreenOpen}
                      style={{ cursor: 'pointer' }}
                    >
                      <YugiohCardDisplayWrapper
                        cardData={card}
                        showFrame={true}
                        width="responsive"
                      />
                    </div>
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
                      backgroundColor: getCardTypeColor(
                        card.cardType || 'Normal',
                      ),
                      '&:hover': {
                        backgroundColor: `${getCardTypeColor(
                          card.cardType || 'Normal',
                        )}DD`,
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
                          (userCredits !== null && userCredits < 25)
                        }
                        sx={{
                          borderColor: getCardTypeColor(
                            card.cardType || 'Normal',
                          ),
                          color: getCardTypeColor(card.cardType || 'Normal'),
                          '&:hover': {
                            borderColor: getCardTypeColor(
                              card.cardType || 'Normal',
                            ),
                            backgroundColor: `${getCardTypeColor(
                              card.cardType || 'Normal',
                            )}10`,
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
                            {userCredits !== null && userCredits < 25 && (
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
                        🎉 Animation completed successfully! Your duel card is
                        now animated.
                      </Alert>
                    )}
                  </Stack>

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
                        primary="Card Type"
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
                                backgroundColor: getCardTypeColor(
                                  card.cardType || 'Normal',
                                ),
                              }}
                            />
                            <Box component="span">
                              {card.cardType || 'Unknown'}
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>

                    {card.attribute && (
                      <ListItem>
                        <ListItemIcon>
                          <FavoriteIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Attribute"
                          secondary={card.attribute}
                        />
                      </ListItem>
                    )}

                    {card.level !== undefined && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary="Level" secondary={card.level} />
                      </ListItem>
                    )}

                    {card.rank !== undefined && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="warning" />
                        </ListItemIcon>
                        <ListItemText primary="Rank" secondary={card.rank} />
                      </ListItem>
                    )}

                    {card.atk !== undefined && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="error" />
                        </ListItemIcon>
                        <ListItemText primary="ATK" secondary={card.atk} />
                      </ListItem>
                    )}

                    {card.def !== undefined && (
                      <ListItem>
                        <ListItemIcon>
                          <InfoIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText primary="DEF" secondary={card.def} />
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
                  </List>
                </Paper>
              </Fade>

              {/* Card Description */}
              {card.description && (
                <Fade in={showDetails}>
                  <Paper sx={{ p: 3, borderRadius: 3 }}>
                    <Typography
                      variant="h6"
                      gutterBottom
                      sx={{ mb: 2, fontWeight: 700 }}
                    >
                      Card Description
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontFamily: 'serif', lineHeight: 1.6 }}
                    >
                      {card.description}
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
            <div style={{ transform: 'scale(1.5)' }}>
              <YugiohCardDisplayWrapper
                cardData={card}
                showFrame={true}
                width="responsive"
              />
            </div>
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
          feature="duel card animation"
          action="animate"
        />
      )}
    </>
  );
};

export default YugiohCardDetailPage;

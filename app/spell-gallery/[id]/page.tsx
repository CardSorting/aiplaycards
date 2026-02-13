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
import { MTGCardDisplayWrapper } from '@components/CardDisplayWrapper';
import { MTGCardData } from '@components/CardDisplayWrapper/types';
import { InsufficientCreditsDialog } from '@components/InsufficientCreditsDialog';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface UserMTGCard extends MTGCardData {
  id: number;
  name: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
  type: string;
  supertype?: string;
  subtype?: string;
  description?: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'mythic';
  animationUrl?: string;
  animationKey?: string;
  animationPrompt?: string;
  animatedAt?: string;
}

const MTGCardDetailPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const cardId = params?.id as string;

  const [card, setCard] = useState<UserMTGCard | null>(null);
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
        const response = await fetch(`/api/mtg-cards/${cardId}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Card not found');
          } else {
            setError('Failed to fetch card');
          }
          return;
        }

        const data = await response.json();
        const mtgCard = {
          ...data.data,
          animationUrl: data.data.animationUrl,
          animationKey: data.data.animationKey,
          animationPrompt: data.data.animationPrompt,
          animatedAt: data.data.animatedAt,
        };

        setCard(mtgCard);

        // If card already has animation, mark as completed to hide button
        if (mtgCard.animationUrl) {
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

  const handleShare = () => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com';
    const cardUrl = `${siteUrl}/spell-gallery/${cardId}`;

    if (navigator.share) {
      navigator.share({
        title: `Check out my ${card?.name} spell card!`,
        text: `I created this ${card?.name} spell card using PlayMore TCG`,
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
    const pageUrl = `${siteUrl}/spell-gallery/${cardId}`;
    const oembed = `${siteUrl}/api/oembed?url=${encodeURIComponent(pageUrl)}`;
    const iframe = `<iframe src="${siteUrl}/embed/mtg-card/${card?.id}" width="420" height="680" frameborder="0" allowfullscreen loading="lazy" style="max-width:100%;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);"></iframe>`;
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

  const getRarityColor = useCallback((rarity: string) => {
    const rarityColors: Record<string, string> = {
      common: '#000000',
      uncommon: '#C0C0C0',
      rare: '#FFD700',
      mythic: '#FF8C00',
    };
    return rarityColors[rarity?.toLowerCase()] || '#000000';
  }, []);

  const getRarityGradient = useCallback(
    (rarity: string) => {
      const color = getRarityColor(rarity);
      return `linear-gradient(135deg, ${color}22, ${color}08)`;
    },
    [getRarityColor],
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
            type: card.type,
            supertype: card.supertype || 'Card',
            subtype: card.subtype,
            description: card.description,
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
              const cardResponse = await fetch(`/api/mtg-cards/${cardId}`);
              if (cardResponse.ok) {
                const cardData = await cardResponse.json();
                const mtgCard = {
                  ...cardData.data,
                  animationUrl: cardData.data.animationUrl,
                  animationKey: cardData.data.animationKey,
                  animationPrompt: cardData.data.animationPrompt,
                  animatedAt: cardData.data.animatedAt,
                };
                setCard(mtgCard);

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
      router.push(`/checkout/print/mtg/${card.id}`);
    }
  }, [card, router]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography variant="body1" color="text.secondary">
            Loading spell card...
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
        <Button component={Link} href="/Spell-gallery" variant="outlined">
          Back to Spell Gallery
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${card.name} - Spell Card Collection`}
        description={`Explore ${card.name}, a custom ${card.type} spell card${
          card.description ? `: ${card.description.substring(0, 100)}...` : ''
        }. Created with PlayMore TCG.`}
      />

      {/* Hero Section */}
      <Box
        sx={{
          background: getRarityGradient(card.rarity || 'common'),
          borderBottom: `2px solid ${getRarityColor(
            card.rarity || 'common',
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
              href="/Spell-gallery"
              variant="text"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: `${getRarityColor(
                    card.rarity || 'common',
                  )}20`,
                },
              }}
            >
              Back to Spell Gallery
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
                      backgroundColor: `${getRarityColor(
                        card.rarity || 'common',
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
                      backgroundColor: `${getRarityColor(
                        card.rarity || 'common',
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
                      backgroundColor: `${getRarityColor(
                        card.rarity || 'common',
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
                    textShadow: `2px 2px 4px ${getRarityColor(
                      card.rarity || 'common',
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
                  {card.type && (
                    <Chip
                      label={card.type}
                      size="medium"
                      sx={{
                        backgroundColor: getRarityColor(
                          card.rarity || 'common',
                        ),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {card.rarity && (
                    <Chip
                      label={card.rarity}
                      size="medium"
                      sx={{
                        backgroundColor: `${getRarityColor(card.rarity)}40`,
                        color: 'text.primary',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
              </Box>
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
                  background: `linear-gradient(90deg, ${getRarityColor(
                    card.rarity || 'common',
                  )}, ${getRarityColor(card.rarity || 'common')}80)`,
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
                  Spell Card Preview
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
                      position: 'relative',
                    }}
                  >
                    <div
                      onClick={handleFullscreenOpen}
                      style={{ cursor: 'pointer' }}
                    >
                      <MTGCardDisplayWrapper
                        card={{
                          id: card.id,
                          name: card.name,
                          type: card.type || 'Creature',
                          supertype: 'Card',
                          rarity: card.rarity || 'common',
                          description: card.description,
                          isPublic: card.isPublic || false,
                          createdAt: card.createdAt,
                          imageData: card.imageData,
                          cardEditorState: card.cardEditorState,
                        }}
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
                      backgroundColor: getRarityColor(card.rarity || 'common'),
                      '&:hover': {
                        backgroundColor: `${getRarityColor(
                          card.rarity || 'common',
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
                          borderColor: getRarityColor(card.rarity || 'common'),
                          color: getRarityColor(card.rarity || 'common'),
                          '&:hover': {
                            borderColor: getRarityColor(
                              card.rarity || 'common',
                            ),
                            backgroundColor: `${getRarityColor(
                              card.rarity || 'common',
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
                        🎉 Animation completed successfully! Your Spell card is
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
                                backgroundColor: getRarityColor(
                                  card.rarity || 'common',
                                ),
                              }}
                            />
                            <Box component="span">{card.type || 'Unknown'}</Box>
                          </Box>
                        }
                      />
                    </ListItem>

                    {card.rarity && (
                      <ListItem>
                        <ListItemIcon>
                          <FavoriteIcon color="error" />
                        </ListItemIcon>
                        <ListItemText
                          primary="Rarity"
                          secondary={card.rarity}
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
              <MTGCardDisplayWrapper
                card={{
                  id: card.id,
                  name: card.name,
                  type: card.type || 'Creature',
                  supertype: 'Card',
                  rarity: card.rarity || 'common',
                  description: card.description,
                  isPublic: card.isPublic || false,
                  createdAt: card.createdAt,
                  imageData: card.imageData,
                  cardEditorState: card.cardEditorState,
                }}
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
          feature="Spell card animation"
          action="animate"
        />
      )}
    </>
  );
};

export default MTGCardDetailPage;

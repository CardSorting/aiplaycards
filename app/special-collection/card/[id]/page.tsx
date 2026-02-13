'use client';
import { useSession } from 'next-auth/react';

import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  AppBar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Slide,
  Snackbar,
  Stack,
  TextField,
  Toolbar,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Animation as AnimationIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as BounceIcon,
  Category as CategoryIcon,
  Close as CloseIcon,
  CollectionsBookmark as CollectionIcon,
  Download as DownloadIcon,
  FlashOn as FlashIcon,
  Fullscreen as FullscreenIcon,
  Print as PrintIcon,
  RotateRight as RotateIcon,
  Schedule as ScheduleIcon,
  ShoppingCart as SellIcon,
  Share as ShareIcon,
  AutoAwesome as SparkleIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import { SEO } from '@layout';
import Link from 'next/link';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface SpecialCard {
  id: number;
  cardName: string;
  imageUrl: string;
  rarity: string;
  categoryId?: number | null;
  categoryName?: string | null;
  categoryColor?: string | null;
  claimedAt: string;
  originalSlotNumber: number;
  packClaimId: number;
  packDisplayName?: string;
  claimMethod?: string;
}

interface AnimationJob {
  jobId: string;
  status: string;
  animationType: string;
  duration: number;
  creditCost: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  animationData?: any;
  error?: string;
}

interface AnimationTemplate {
  id: number;
  name: string;
  description?: string;
  animationType: string;
  duration: number;
  creditCost: number;
  rarityFilter?: string;
  isPremium: boolean;
  animationConfig: any;
}

export default function SpecialCardDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const cardId = params?.id as string;

  const [card, setCard] = useState<SpecialCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Animation states
  const [animationMenuAnchor, setAnimationMenuAnchor] =
    useState<null | HTMLElement>(null);
  const [animationTemplates, setAnimationTemplates] = useState<
    AnimationTemplate[]
  >([]);
  const [animationJobs, setAnimationJobs] = useState<AnimationJob[]>([]);
  const [animationLoading, setAnimationLoading] = useState(false);
  const [animationError, setAnimationError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeAnimation, setActiveAnimation] = useState<AnimationJob | null>(
    null,
  );

  // Selling state
  const [sellDialogOpen, setSellDialogOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState('');
  const [sellLoading, setSellLoading] = useState(false);

  const backHref = '/special-collection';

  useEffect(() => {
    if (!cardId) return;
    loadCard();
    loadAnimationTemplates();
  }, [cardId]);

  // Poll for active animation status
  useEffect(() => {
    if (
      !activeAnimation ||
      activeAnimation.status === 'completed' ||
      activeAnimation.status === 'failed'
    )
      return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(
          `/api/special-collection/animation/status/${activeAnimation.jobId}`,
        );
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActiveAnimation(data.job);
            if (data.job.status === 'completed') {
              setSuccessMessage(
                `Animation "${data.job.animationType}" completed successfully! ✨`,
              );
              clearInterval(pollInterval);
            } else if (data.job.status === 'failed') {
              setAnimationError(`Animation failed: ${data.job.error}`);
              clearInterval(pollInterval);
            }
          }
        }
      } catch (error) {
        console.error('Failed to poll animation status:', error);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [activeAnimation]);

  const loadCard = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/special-collection/card/${cardId}`);
      if (!response.ok) {
        setError(
          response.status === 404 ? 'Card not found' : 'Failed to fetch card',
        );
        return;
      }
      const data = await response.json();
      setCard(data.card);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  const loadAnimationTemplates = async () => {
    try {
      const response = await fetch(
        `/api/special-collection/animation/templates?rarity=${
          card?.rarity || ''
        }`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setAnimationTemplates(data.templates);
        }
      }
    } catch (error) {
      console.error('Failed to load animation templates:', error);
    }
  };

  const handleAnimationMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnimationMenuAnchor(event.currentTarget);
  };

  const handleAnimationMenuClose = () => {
    setAnimationMenuAnchor(null);
  };

  const startAnimation = async (
    animationType: string,
    template?: AnimationTemplate,
  ) => {
    if (!card) return;

    setAnimationLoading(true);
    setAnimationError(null);
    handleAnimationMenuClose();

    try {
      const response = await fetch('/api/special-collection/animation/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          animationType,
          duration: template?.duration || 3000,
          animationConfig: template?.animationConfig,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setActiveAnimation({
          jobId: data.jobId,
          status: 'pending',
          animationType,
          duration: template?.duration || 3000,
          creditCost: data.estimatedCost,
          createdAt: new Date().toISOString(),
        });
        setSuccessMessage(
          `Animation "${animationType}" queued! Cost: ${data.estimatedCost} credits`,
        );
      } else {
        setAnimationError(
          data.userMessage || data.error || 'Failed to start animation',
        );
      }
    } catch (error) {
      setAnimationError('Failed to start animation');
      console.error('Animation start error:', error);
    } finally {
      setAnimationLoading(false);
    }
  };

  const getAnimationIcon = (type: string) => {
    switch (type) {
      case 'sparkle':
        return <SparkleIcon />;
      case 'glow':
        return <FlashIcon />;
      case 'rotate':
        return <RotateIcon />;
      case 'bounce':
        return <BounceIcon />;
      default:
        return <AnimationIcon />;
    }
  };

  const handleShare = useCallback(() => {
    if (navigator.share && card?.imageUrl) {
      fetch(card.imageUrl)
        .then(res => res.blob())
        .then(blob => {
          const file = new File([blob], `${card?.cardName || 'Card'}.png`, {
            type: 'image/png',
          });
          navigator.share({
            title: `Check out my ${card?.cardName} special card!`,
            text: `I collected this ${card?.cardName} special card from my premium pack collection!`,
            files: [file],
          });
        })
        .catch(() => {
          if (navigator.share) {
            navigator.share({
              title: `${card?.cardName} Special Card`,
              text: `Check out my ${card?.cardName} special card from PlayMore TCG!`,
              url: window.location.href,
            });
          }
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Card link copied to clipboard!');
    }
  }, [card]);

  const handleDownload = useCallback(() => {
    if (card?.imageUrl) {
      const link = document.createElement('a');
      link.download = `${card?.cardName || 'Special-Card'}.png`;
      link.href = card.imageUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [card]);

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

  // Print order handler - redirect to checkout page
  const handlePrintOrderOpen = useCallback(() => {
    if (card) {
      router.push(`/checkout/print/${card.id}`);
    }
  }, [card, router]);

  // Selling handlers
  const handleSellOpen = useCallback(() => {
    setSellPrice('');
    setSellDialogOpen(true);
  }, []);

  const handleSellClose = useCallback(() => {
    setSellDialogOpen(false);
    setSellPrice('');
    setSellLoading(false);
  }, []);

  const handleSellSubmit = useCallback(async () => {
    if (!card || !sellPrice) return;

    setSellLoading(true);
    try {
      const response = await fetch('/api/marketplace', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cardId: card.id,
          priceCredits: parseInt(sellPrice, 10),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      setSuccessMessage(
        `Successfully listed ${card.cardName} for ${sellPrice} credits!`,
      );
      setSellDialogOpen(false);
      setSellPrice('');

      // Redirect to marketplace or user's listings
      setTimeout(() => {
        router.push('/marketplace/manage/listings');
      }, 2000);
    } catch (err) {
      setAnimationError(
        err instanceof Error ? err.message : 'Failed to list card for sale',
      );
    } finally {
      setSellLoading(false);
    }
  }, [card, sellPrice, router]);

  const getRarityColor = useCallback((rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return '#9e9e9e';
      case 'uncommon':
        return '#4caf50';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#1976d2';
    }
  }, []);

  const getCategoryColor = useCallback((color: string | null | undefined) => {
    return color || '#1976d2';
  }, []);

  const getRarityGradient = useCallback(
    (rarity: string) => {
      const color = getRarityColor(rarity);
      return `linear-gradient(135deg, ${color}22, ${color}08)`;
    },
    [getRarityColor],
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
        <Button
          component={Link}
          href={backHref}
          variant="outlined"
          startIcon={<ArrowBackIcon />}
        >
          Back to Collection
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${card.cardName} - Special Collection Card`}
        description={`View ${card.cardName}, a premium ${card.rarity} card from my special collection.`}
      />

      <Box
        sx={{
          background: getRarityGradient(card.rarity),
          borderBottom: `2px solid ${getRarityColor(card.rarity)}40`,
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
              href={backHref}
              variant="text"
              startIcon={<ArrowBackIcon />}
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: `${getRarityColor(card.rarity)}20`,
                },
              }}
            >
              Back to Collection
            </Button>

            <Stack direction="row" spacing={1}>
              <Chip
                icon={<StarIcon />}
                label="Special Card"
                size="small"
                color="warning"
                variant="filled"
              />

              <Tooltip title="Animate Card">
                <IconButton
                  onClick={handleAnimationMenuOpen}
                  disabled={animationLoading}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getRarityColor(card.rarity)}20`,
                    },
                  }}
                >
                  <Badge
                    color="secondary"
                    variant="dot"
                    invisible={
                      !activeAnimation || activeAnimation.status === 'completed'
                    }
                  >
                    {animationLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <AnimationIcon />
                    )}
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="View Fullscreen">
                <IconButton
                  onClick={handleFullscreenOpen}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getRarityColor(card.rarity)}20`,
                    },
                  }}
                >
                  <FullscreenIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Share Card">
                <IconButton
                  onClick={handleShare}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getRarityColor(card.rarity)}20`,
                    },
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Download Card">
                <IconButton
                  onClick={handleDownload}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getRarityColor(card.rarity)}20`,
                    },
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Order Print">
                <IconButton
                  onClick={handlePrintOrderOpen}
                  disabled={!user}
                  sx={{
                    color: 'text.primary',
                    '&:hover': {
                      backgroundColor: `${getRarityColor(card.rarity)}20`,
                    },
                  }}
                >
                  <PrintIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Sell Card">
                <IconButton
                  onClick={handleSellOpen}
                  disabled={!user}
                  sx={{
                    color: 'success.main',
                    '&:hover': {
                      backgroundColor: 'success.light',
                      color: 'success.contrastText',
                    },
                  }}
                >
                  <SellIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

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
                    textShadow: `2px 2px 4px ${getRarityColor(card.rarity)}40`,
                  }}
                >
                  {card.cardName}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ mb: 2 }}
                >
                  <Chip
                    label="Special Card"
                    size="medium"
                    sx={{
                      backgroundColor: `${getRarityColor(card.rarity)}40`,
                      color: 'text.primary',
                      fontWeight: 600,
                    }}
                  />
                  <Chip
                    label={card.rarity}
                    size="medium"
                    sx={{
                      backgroundColor: getRarityColor(card.rarity),
                      color: 'white',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 1,
                    }}
                  />
                  {card.categoryName && (
                    <Chip
                      label={card.categoryName}
                      size="medium"
                      sx={{
                        backgroundColor: getCategoryColor(card.categoryColor),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
              </Box>

              <Box
                sx={{
                  backgroundColor: `${getRarityColor(card.rarity)}20`,
                  border: `2px solid ${getRarityColor(card.rarity)}80`,
                  borderRadius: 2,
                  p: 2,
                  minWidth: 120,
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h3"
                  component="div"
                  sx={{ fontWeight: 800, color: getRarityColor(card.rarity) }}
                >
                  #{card.originalSlotNumber}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontWeight: 600 }}
                >
                  Pack Position
                </Typography>
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
                  Claimed{' '}
                  {new Date(card.claimedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
              </Stack>

              {card.packDisplayName && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CollectionIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    From {card.packDisplayName}
                  </Typography>
                </Stack>
              )}

              {card.categoryName && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <CategoryIcon color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {card.categoryName} Collection
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Stack spacing={3}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 4,
              background: 'linear-gradient(145deg, #fafafa 0%, #f0f0f0 100%)',
              position: 'relative',
              overflow: 'hidden',
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
              {!imageLoaded && (
                <Box
                  sx={{
                    width: '80%',
                    height: '100%',
                    borderRadius: 3,
                    position: 'absolute',
                    bgcolor: 'rgba(0,0,0,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}

              <Zoom in={true} timeout={600}>
                <Box
                  sx={{
                    width: { xs: '100%', sm: '80%', md: '70%' },
                    maxWidth: 500,
                    position: 'relative',
                  }}
                >
                  <img
                    src={card.imageUrl}
                    alt={card.cardName}
                    onLoad={handleImageLoad}
                    onClick={handleFullscreenOpen}
                    style={{
                      width: '100%',
                      height: 'auto',
                      borderRadius: '12px',
                      boxShadow: `0 20px 40px ${getRarityColor(card.rarity)}40`,
                      objectFit: 'contain',
                      cursor: 'pointer',
                      border: `3px solid ${getRarityColor(card.rarity)}60`,
                    }}
                  />
                </Box>
              </Zoom>
            </Box>
          </Paper>

          {/* Quick Actions Panel */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2 }}
            >
              Quick Actions
            </Typography>
            <Stack spacing={2} sx={{ mb: 3 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{
                  backgroundColor: getRarityColor(card.rarity),
                  '&:hover': {
                    backgroundColor: `${getRarityColor(card.rarity)}DD`,
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

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<SellIcon />}
                onClick={handleSellOpen}
                disabled={!user}
                color="success"
              >
                List for Sale
              </Button>
            </Stack>
          </Paper>

          {/* Card Details Panel */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
              sx={{ mb: 2 }}
            >
              Card Details
            </Typography>
            <Divider sx={{ mb: 3 }} />

            <Stack spacing={2}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="text.secondary">
                  Rarity
                </Typography>
                <Chip
                  label={card.rarity}
                  sx={{
                    backgroundColor: getRarityColor(card.rarity),
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                />
              </Stack>

              {card.categoryName && (
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body1" color="text.secondary">
                    Collection
                  </Typography>
                  <Chip
                    label={card.categoryName}
                    sx={{
                      backgroundColor: getCategoryColor(card.categoryColor),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </Stack>
              )}

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="text.secondary">
                  Pack Position
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  #{card.originalSlotNumber}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="text.secondary">
                  Claim Method
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={600}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {card.claimMethod?.replace('_', ' ') || 'Pack Opening'}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body1" color="text.secondary">
                  Claimed Date
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {new Date(card.claimedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Stack>
            </Stack>
          </Paper>
        </Stack>
      </Container>

      {/* Fullscreen Dialog */}
      <Dialog
        fullScreen
        open={fullscreenOpen}
        onClose={handleFullscreenClose}
        TransitionComponent={Transition}
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
              {card.cardName} - Fullscreen View
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
              <IconButton color="inherit" onClick={handleDownload}>
                <DownloadIcon />
              </IconButton>
            </Stack>
          </Toolbar>
        </AppBar>

        <DialogContent
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: 0,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          <Box
            sx={{
              transform: `scale(${zoomLevel})`,
              transition: 'transform 0.2s ease',
              cursor: zoomLevel > 1 ? 'grab' : 'default',
              maxWidth: '100%',
              maxHeight: '100%',
            }}
          >
            <img
              src={card.imageUrl}
              alt={card.cardName}
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
              }}
            />
          </Box>
        </DialogContent>
      </Dialog>

      {/* Animation Menu */}
      <Menu
        anchorEl={animationMenuAnchor}
        open={Boolean(animationMenuAnchor)}
        onClose={handleAnimationMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
            borderRadius: 2,
          },
        }}
      >
        {animationTemplates.length > 0
          ? animationTemplates.map(template => (
              <MenuItem
                key={template.id}
                onClick={() => startAnimation(template.animationType, template)}
                disabled={animationLoading}
              >
                <ListItemIcon>
                  {getAnimationIcon(template.animationType)}
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  secondary={`${template.creditCost} credits • ${
                    template.duration / 1000
                  }s`}
                />
              </MenuItem>
            ))
          : [
              <MenuItem
                key="sparkle"
                onClick={() => startAnimation('sparkle')}
                disabled={animationLoading}
              >
                <ListItemIcon>
                  <SparkleIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Sparkle Effect"
                  secondary="5 credits • 3s"
                />
              </MenuItem>,
              <MenuItem
                key="glow"
                onClick={() => startAnimation('glow')}
                disabled={animationLoading}
              >
                <ListItemIcon>
                  <FlashIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Golden Glow"
                  secondary="5 credits • 3s"
                />
              </MenuItem>,
              <MenuItem
                key="rotate"
                onClick={() => startAnimation('rotate')}
                disabled={animationLoading}
              >
                <ListItemIcon>
                  <RotateIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Rotate Animation"
                  secondary="5 credits • 3s"
                />
              </MenuItem>,
              <MenuItem
                key="bounce"
                onClick={() => startAnimation('bounce')}
                disabled={animationLoading}
              >
                <ListItemIcon>
                  <BounceIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Bounce Effect"
                  secondary="5 credits • 3s"
                />
              </MenuItem>,
            ]}
      </Menu>

      {/* Active Animation Status */}
      {activeAnimation &&
        activeAnimation.status !== 'completed' &&
        activeAnimation.status !== 'failed' && (
          <Paper
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16,
              p: 2,
              minWidth: 280,
              zIndex: 1300,
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Box>
                {activeAnimation.status === 'pending' ? (
                  <CircularProgress size={24} color="primary" />
                ) : (
                  <CircularProgress size={24} color="success" />
                )}
              </Box>
              <Box flex={1}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {activeAnimation.animationType} Animation
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Status: {activeAnimation.status} •{' '}
                  {activeAnimation.creditCost} credits
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

      {/* Success Message */}
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={4000}
        onClose={() => setSuccessMessage(null)}
        message={successMessage}
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={() => setSuccessMessage(null)}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />

      {/* Error Message */}
      <Snackbar
        open={Boolean(animationError)}
        autoHideDuration={6000}
        onClose={() => setAnimationError(null)}
      >
        <Alert
          onClose={() => setAnimationError(null)}
          severity="error"
          sx={{ width: '100%' }}
        >
          {animationError}
        </Alert>
      </Snackbar>

      {/* Sell Dialog */}
      <Dialog
        open={sellDialogOpen}
        onClose={handleSellClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sell {card.cardName}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              List this special collection card on the marketplace. Other users
              will be able to purchase it for the price you set.
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 2,
                bgcolor: getRarityGradient(card.rarity),
                borderRadius: 2,
                border: `2px solid ${getRarityColor(card.rarity)}40`,
              }}
            >
              <img
                src={card.imageUrl}
                alt={card.cardName}
                style={{
                  width: '120px',
                  height: 'auto',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />
            </Box>

            <Stack spacing={1}>
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Chip
                  label={card.rarity}
                  sx={{
                    backgroundColor: getRarityColor(card.rarity),
                    color: 'white',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                  }}
                />
                {card.categoryName && (
                  <Chip
                    label={card.categoryName}
                    sx={{
                      backgroundColor: getCategoryColor(card.categoryColor),
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                )}
              </Stack>
            </Stack>

            <TextField
              fullWidth
              label="Price (Credits)"
              type="number"
              value={sellPrice}
              onChange={e => setSellPrice(e.target.value)}
              placeholder="Enter price in credits"
              helperText="Set a competitive price for your special collection card"
              InputProps={{
                inputProps: { min: 1, step: 1 },
              }}
            />

            {/* Quick price suggestions */}
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Quick options:
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {['100', '500', '1000', '2500', '5000'].map(price => (
                  <Chip
                    key={price}
                    label={`${price} credits`}
                    onClick={() => setSellPrice(price)}
                    variant={sellPrice === price ? 'filled' : 'outlined'}
                    color={sellPrice === price ? 'success' : 'default'}
                    sx={{ cursor: 'pointer', mb: 1 }}
                  />
                ))}
              </Stack>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              Once listed, your card will appear in the Special Collection
              marketplace. You can cancel the listing anytime from your
              marketplace management page.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSellClose} disabled={sellLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSellSubmit}
            variant="contained"
            color="success"
            disabled={!sellPrice || parseInt(sellPrice, 10) <= 0 || sellLoading}
          >
            {sellLoading ? 'Creating Listing...' : 'List for Sale'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

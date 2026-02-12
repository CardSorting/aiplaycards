'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  Link,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StyleIcon from '@mui/icons-material/Style';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { urlFriendlySlug } from '../../../../src/routes';
import StarIcon from '@mui/icons-material/Star';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface PackCard {
  id: number;
  name: string;
  imageUrl: string;
  rarity: string;
}

interface SpecialPackDetail {
  id: number;
  categoryId?: number | null;
  categoryName?: string;
  categoryColor?: string | null;
  creditCost: number;
  totalCards: number;
  cards: PackCard[];
  createdAt: string;
  status: string;
}

interface PackOpeningResult {
  success: boolean;
  claimedCards?: PackCard[];
  newBalance?: number;
  redirectUrl?: string;
  error?: string;
  errorCode?: string;
  userMessage?: string;
  retryable?: boolean;
  supportedActions?: string[];
}

export default function SpecialPackDetailPage() {
  const [pack, setPack] = useState<SpecialPackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openingDialog, setOpeningDialog] = useState(false);
  const [openingResult, setOpeningResult] = useState<PackOpeningResult | null>(
    null,
  );
  const [revealedCards, setRevealedCards] = useState<PackCard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isRevealing, setIsRevealing] = useState(false);

  const router = useRouter();
  const params = useParams();
  const packId = params.id as string;

  useEffect(() => {
    if (packId) {
      loadPack();
    }
  }, [packId]);

  // Handle sequential card revealing
  useEffect(() => {
    if (openingResult?.claimedCards && openingDialog && !isRevealing) {
      setIsRevealing(true);
      setRevealedCards([]);
      setCurrentCardIndex(0);
      startCardReveal();
    }
  }, [openingResult, openingDialog]);

  const startCardReveal = () => {
    if (!openingResult?.claimedCards) return;

    const cards = openingResult.claimedCards;
    let index = 0;

    const revealNextCard = () => {
      if (index < cards.length) {
        setRevealedCards(prev => [...prev, cards[index]]);
        setCurrentCardIndex(index);
        index++;

        // Wait 2 seconds before revealing next card (longer for better experience)
        setTimeout(revealNextCard, 2000);
      } else {
        // All cards revealed
        setIsRevealing(false);
      }
    };

    // Start revealing after a small delay
    setTimeout(revealNextCard, 500);
  };

  const loadPack = async () => {
    try {
      const response = await fetch(`/api/special-packs/pack/${packId}`);
      const data = await response.json();

      if (response.ok) {
        setPack(data.pack);
        setError(null);
      } else {
        setError(data.error || 'Failed to load pack details');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPack = async () => {
    if (!pack) return;

    setOpening(true);
    setError(null); // Clear any previous errors

    try {
      const response = await fetch(`/api/special-collection/open/${pack.id}`, {
        method: 'POST',
      });

      const data = await response.json();
      setOpeningResult(data);

      if (data.success) {
        setOpeningDialog(true);
      } else {
        // Use enhanced error handling
        handlePackOpeningError(data, response.status);
      }
    } catch (err) {
      // Network or unexpected errors
      console.error('Pack opening error:', err);
      setError(
        'Unable to connect to the server. Please check your internet connection and try again.',
      );
      setOpeningResult(null);
    } finally {
      setOpening(false);
    }
  };

  const handlePackOpeningError = (
    errorData: PackOpeningResult,
    statusCode: number,
  ) => {
    const userMessage =
      errorData.userMessage || errorData.error || 'Failed to open pack';

    // Handle specific error cases with appropriate actions
    switch (errorData.errorCode) {
      case 'PACK_ALREADY_OPENED':
        // Automatically redirect to collection if pack was already opened
        if (errorData.redirectUrl) {
          setTimeout(() => router.push(errorData.redirectUrl!), 2000);
          setError(`${userMessage} Redirecting to your collection...`);
        } else {
          setError(userMessage);
        }
        break;

      case 'INSUFFICIENT_CREDITS':
        setError(userMessage);
        // Could add a purchase credits button here in the future
        break;

      case 'PACK_NOT_FOUND':
        setError(userMessage);
        // Could redirect back to pack selection
        setTimeout(() => router.push('/special-packs'), 3000);
        break;

      case 'UNAUTHORIZED':
        setError(userMessage);
        // Could trigger a re-authentication flow
        break;

      case 'SERVER_ERROR':
        setError(
          `${userMessage} ${errorData.retryable ? 'You can try again.' : ''}`,
        );
        break;

      default:
        setError(userMessage);
    }
  };

  const handleGoToCollection = () => {
    if (openingResult?.redirectUrl) {
      router.push(openingResult.redirectUrl);
    } else {
      router.push('/special-collection');
    }
  };

  const handleCloseDialog = () => {
    setOpeningDialog(false);
    setOpeningResult(null);
    setRevealedCards([]);
    setCurrentCardIndex(0);
    setIsRevealing(false);
  };

  const handleSkipReveal = () => {
    if (!openingResult?.claimedCards) return;

    // Show all remaining cards instantly
    setRevealedCards(openingResult.claimedCards);
    setIsRevealing(false);
  };

  const getCategoryColor = (color: string | null | undefined) => {
    return color || '#1976d2';
  };

  const getRarityColor = (rarity: string) => {
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
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading pack details...
        </Typography>
      </Container>
    );
  }

  if (!pack) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Pack not found or you don't have access to it.
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/special-packs')}
          sx={{ mt: 2 }}
        >
          Back to PlayMore Packs
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            onClick={() => router.push('/special-packs')}
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            PlayMore Packs
          </Link>
          {pack.categoryName && (
            <Link
              color="inherit"
              onClick={() =>
                router.push(
                  `/special-packs/${urlFriendlySlug(pack.categoryName || '')}`,
                )
              }
              sx={{
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {pack.categoryName}
            </Link>
          )}
          <Typography color="text.primary">Pack #{pack.id}</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
        </Box>

        {error && (
          <Alert
            severity="error"
            onClose={() => setError(null)}
            action={
              openingResult?.retryable ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => {
                    setError(null);
                    handleOpenPack();
                  }}
                >
                  Retry
                </Button>
              ) : openingResult?.supportedActions?.includes(
                  'view_collection',
                ) ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push('/special-collection')}
                >
                  View Collection
                </Button>
              ) : openingResult?.supportedActions?.includes('browse_packs') ? (
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => router.push('/special-packs')}
                >
                  Browse Packs
                </Button>
              ) : null
            }
          >
            {error}
          </Alert>
        )}

        {/* Pack Overview */}
        <Paper sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              {/* Pack Visual */}
              <Card
                sx={{
                  height: 400,
                  display: 'flex',
                  flexDirection: 'column',
                  background: `linear-gradient(135deg, ${getCategoryColor(
                    pack.categoryColor,
                  )}, ${getCategoryColor(pack.categoryColor)}CC)`,
                  color: 'white',
                  position: 'relative',
                }}
              >
                <CardContent
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                  }}
                >
                  <StyleIcon sx={{ fontSize: 80, mb: 2, opacity: 0.9 }} />

                  <Typography variant="h3" fontWeight={800} gutterBottom>
                    PlayMore Pack
                  </Typography>

                  <Typography variant="h5" sx={{ opacity: 0.9 }}>
                    #{pack.id}
                  </Typography>

                  <Chip
                    icon={<StarIcon />}
                    label="Premium Collection"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      color: 'white',
                      fontWeight: 'bold',
                    }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              {/* Pack Details */}
              <Stack spacing={3}>
                <Box>
                  <Typography variant="h4" fontWeight={800} gutterBottom>
                    Premium Card Pack
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {pack.categoryColor && (
                      <Box
                        sx={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          backgroundColor: getCategoryColor(pack.categoryColor),
                          mr: 1.5,
                        }}
                      />
                    )}
                    <Typography variant="h6">
                      {pack.categoryName || 'Special Collection'}
                    </Typography>
                  </Box>
                </Box>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    icon={<StyleIcon />}
                    label={`${pack.totalCards} cards`}
                    variant="outlined"
                    color="primary"
                  />
                  <Chip
                    icon={<CreditCardIcon />}
                    label={`${pack.creditCost} credits`}
                    variant="outlined"
                    color="secondary"
                  />
                  {Array.from(new Set(pack.cards.map(c => c.rarity))).map(
                    rarity => (
                      <Chip
                        key={rarity}
                        label={rarity}
                        size="small"
                        sx={{
                          backgroundColor: getRarityColor(rarity),
                          color: 'white',
                          fontWeight: 'bold',
                        }}
                      />
                    ),
                  )}
                </Stack>

                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ lineHeight: 1.7 }}
                >
                  This exclusive pack contains {pack.totalCards} carefully
                  curated cards from the {pack.categoryName || 'Special'}{' '}
                  collection. Each card has been handpicked for its unique
                  artwork and theme, making this a truly premium experience.
                </Typography>

                <Box sx={{ pt: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleOpenPack}
                    disabled={opening || pack.status !== 'completed'}
                    startIcon={
                      opening ? (
                        <CircularProgress size={20} />
                      ) : (
                        <OpenInNewIcon />
                      )
                    }
                    sx={{
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 'bold',
                      backgroundColor: getCategoryColor(pack.categoryColor),
                      '&:hover': {
                        backgroundColor: getCategoryColor(pack.categoryColor),
                        filter: 'brightness(0.9)',
                      },
                    }}
                  >
                    {opening
                      ? 'Opening Pack...'
                      : `Open Pack (${pack.creditCost} credits)`}
                  </Button>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

        {/* Card Preview */}
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
            What's Inside This Pack
          </Typography>

          <Grid container spacing={2}>
            {pack.cards.map(card => (
              <Grid item xs={6} sm={4} md={3} lg={2} key={card.id}>
                <Card sx={{ textAlign: 'center', height: '100%' }}>
                  <CardMedia
                    component="img"
                    height="140"
                    image={card.imageUrl}
                    alt={card.name}
                    sx={{ objectFit: 'cover' }}
                  />
                  <CardContent sx={{ p: 2 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {card.name}
                    </Typography>
                    <Chip
                      label={card.rarity}
                      size="small"
                      sx={{
                        mt: 0.5,
                        backgroundColor: getRarityColor(card.rarity),
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '0.7rem',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Stack>

      {/* Pack Opening Success Dialog */}
      <Dialog
        open={openingDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        disableEscapeKeyDown={isRevealing}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <GiftIcon sx={{ fontSize: 60, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={800}>
              Pack Opened Successfully! 🎉
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent
          sx={{
            minHeight: 300,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {openingResult?.claimedCards && (
            <>
              {/* Card Counter */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {isRevealing ? (
                    <>
                      Revealing Cards... ({revealedCards.length}/
                      {openingResult.claimedCards.length})
                    </>
                  ) : (
                    <>You received {openingResult.claimedCards.length} cards!</>
                  )}
                </Typography>

                {/* Skip Button */}
                {isRevealing && revealedCards.length > 0 && (
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={handleSkipReveal}
                    sx={{ mt: 1 }}
                  >
                    Skip Animation
                  </Button>
                )}
              </Box>

              {/* Sequential Card Display */}
              {isRevealing ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minHeight: 200,
                    justifyContent: 'center',
                  }}
                >
                  {revealedCards.length > 0 && (
                    <Box
                      sx={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {/* Sparkle Effects */}
                      <AutoAwesomeIcon
                        sx={{
                          position: 'absolute',
                          top: -10,
                          left: -10,
                          fontSize: 24,
                          color: 'gold',
                          animation: 'sparkle 1.5s ease-in-out infinite',
                          zIndex: 1,
                          '@keyframes sparkle': {
                            '0%, 100%': {
                              opacity: 0,
                              transform: 'scale(0.8) rotate(0deg)',
                            },
                            '50%': {
                              opacity: 1,
                              transform: 'scale(1.2) rotate(180deg)',
                            },
                          },
                        }}
                      />
                      <AutoAwesomeIcon
                        sx={{
                          position: 'absolute',
                          top: -5,
                          right: -15,
                          fontSize: 18,
                          color: 'cyan',
                          animation: 'sparkle 1.8s ease-in-out infinite 0.5s',
                          zIndex: 1,
                          '@keyframes sparkle': {
                            '0%, 100%': {
                              opacity: 0,
                              transform: 'scale(0.8) rotate(0deg)',
                            },
                            '50%': {
                              opacity: 1,
                              transform: 'scale(1.2) rotate(-180deg)',
                            },
                          },
                        }}
                      />
                      <AutoAwesomeIcon
                        sx={{
                          position: 'absolute',
                          bottom: -8,
                          left: 10,
                          fontSize: 20,
                          color: 'magenta',
                          animation: 'sparkle 2s ease-in-out infinite 1s',
                          zIndex: 1,
                          '@keyframes sparkle': {
                            '0%, 100%': {
                              opacity: 0,
                              transform: 'scale(0.8) rotate(0deg)',
                            },
                            '50%': {
                              opacity: 1,
                              transform: 'scale(1.2) rotate(360deg)',
                            },
                          },
                        }}
                      />

                      <Fade
                        in
                        key={revealedCards[revealedCards.length - 1].id}
                        timeout={1000}
                      >
                        <Card
                          sx={{
                            textAlign: 'center',
                            maxWidth: 220,
                            transform: 'scale(1.15)',
                            boxShadow: `0 12px 40px rgba(0,0,0,0.4), 0 0 20px ${getRarityColor(
                              revealedCards[revealedCards.length - 1].rarity,
                            )}40`,
                            border: '3px solid',
                            borderColor: getRarityColor(
                              revealedCards[revealedCards.length - 1].rarity,
                            ),
                            borderRadius: 2,
                            transition: 'all 0.3s ease-in-out',
                            position: 'relative',
                            overflow: 'visible',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: -2,
                              left: -2,
                              right: -2,
                              bottom: -2,
                              background: `linear-gradient(45deg, ${getRarityColor(
                                revealedCards[revealedCards.length - 1].rarity,
                              )}, transparent, ${getRarityColor(
                                revealedCards[revealedCards.length - 1].rarity,
                              )})`,
                              borderRadius: 2,
                              zIndex: -1,
                              opacity: 0.3,
                            },
                          }}
                        >
                          <CardMedia
                            component="img"
                            height="180"
                            image={
                              revealedCards[revealedCards.length - 1].imageUrl
                            }
                            alt={revealedCards[revealedCards.length - 1].name}
                            sx={{ objectFit: 'cover' }}
                          />
                          <CardContent sx={{ p: 2 }}>
                            <Typography
                              variant="h6"
                              fontWeight={700}
                              gutterBottom
                            >
                              {revealedCards[revealedCards.length - 1].name}
                            </Typography>
                            <Chip
                              label={
                                revealedCards[revealedCards.length - 1].rarity
                              }
                              sx={{
                                backgroundColor: getRarityColor(
                                  revealedCards[revealedCards.length - 1]
                                    .rarity,
                                ),
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '0.9rem',
                                textTransform: 'uppercase',
                                letterSpacing: 1,
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Fade>
                    </Box>
                  )}
                </Box>
              ) : (
                /* All Cards Grid View */
                <Grid container spacing={2} justifyContent="center">
                  {revealedCards.map((card, index) => (
                    <Grid item xs={6} sm={4} md={3} key={card.id}>
                      <Card sx={{ textAlign: 'center' }}>
                        <CardMedia
                          component="img"
                          height="120"
                          image={card.imageUrl}
                          alt={card.name}
                          sx={{ objectFit: 'cover' }}
                        />
                        <CardContent sx={{ p: 1.5 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {card.name}
                          </Typography>
                          <Chip
                            label={card.rarity}
                            size="small"
                            sx={{
                              mt: 0.5,
                              backgroundColor: getRarityColor(card.rarity),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}

              {/* Credits Display */}
              {!isRevealing && openingResult.newBalance !== undefined && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Remaining Credits: {openingResult.newBalance}
                  </Typography>
                </Box>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleCloseDialog} disabled={isRevealing}>
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleGoToCollection}
            disabled={isRevealing}
          >
            View Collection
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

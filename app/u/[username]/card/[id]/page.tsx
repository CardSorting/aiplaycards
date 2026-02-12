'use client';
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
  IconButton,
  Slide,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Fullscreen as FullscreenIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  PhotoLibrary as PhotoLibraryIcon,
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
import Routes from '@routes';
import { CardOptionsProvider } from '@cardEditor/cardOptions';
import { CardStylesProvider } from '@cardEditor/cardStyles/Context';
import CardDisplay from '@cardEditor/cardStyles/components/CardDisplay';
import { cardImgHeight, cardImgWidth } from '@cardEditor/cardStyles';

const Transition = React.forwardRef(function Transition(
  props: any,
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface UserCard {
  id: number;
  name: string;
  type: string;
  subtype?: string;
  supertype: string;
  rarity?: string;
  hitpoints?: number;
  isPublic: boolean;
  illustrator?: string;
  cardNumber?: string;
  totalInSet?: string;

  dexStats?: string;
  imageData?: {
    dataUrl?: string;
    width?: number;
    height?: number;
    generated?: string[];
    thumbs?: string[];
  };
  cardEditorState?: any;
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

const ProfileCardDetailPage: FC = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const user = session?.user;
  const cardId = params?.id as string;
  const usernameParam = params?.username as string;

  const [card, setCard] = useState<UserCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cardState, setCardState] = useState<any>(null);
  const [fullscreenOpen, setFullscreenOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoaded, setImageLoaded] = useState(false);

  const backHref = useMemo(
    () => Routes.Profile(usernameParam),
    [usernameParam],
  );

  // Validate that card belongs to the profile owner; if not, redirect to the correct profile
  useEffect(() => {
    const run = async () => {
      if (!cardId) return;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/cards/${cardId}`);
        if (!response.ok) {
          setError(
            response.status === 404 ? 'Card not found' : 'Failed to fetch card',
          );
          return;
        }
        const data = await response.json();
        const cardData: UserCard = data.data;
        setCard(cardData);

        // Build editor state fallback
        if (cardData.cardEditorState) {
          setCardState(cardData.cardEditorState);
        } else {
          setCardState({
            name: cardData.name,
            hitpoints: cardData.hitpoints || 100,
            supertypeId: 1,
            typeId: 11,
            subtypeId: 1,
            baseSetId: 1,
            illustrator: cardData.illustrator || 'PlayMore TCG',
            cardNumber: cardData.cardNumber || '001',
            totalInSet: cardData.totalInSet || '150',

            dexStats: cardData.dexStats || '',
            ...(cardData.imageData?.generated?.[0] && {
              backgroundImg: { src: cardData.imageData.generated[0] },
            }),
          });
        }

        // Resolve username for card owner and ensure route matches
        const ownerId = cardData.userId;
        if (ownerId) {
          const ownerRes = await fetch(
            `/api/users/profile/${encodeURIComponent(ownerId)}`,
          );
          if (ownerRes.ok) {
            const ownerJson = await ownerRes.json();
            const ownerUsername: string | null =
              ownerJson?.data?.username || null;
            const canonicalHandle = ownerUsername || ownerId;
            if (canonicalHandle && canonicalHandle !== usernameParam) {
              router.replace(
                `${Routes.Profile(canonicalHandle)}/card/${cardId}`,
              );
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load card');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [cardId, usernameParam]);

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
            text: `I created this ${card?.name} monster card using PlayMore TCG`,
            files: [file],
          });
        })
        .catch(() => {
          if (navigator.share) {
            navigator.share({
              title: `${card?.name} Monster Card`,
              text: `Check out my ${card?.name} monster card created with PlayMore TCG!`,
              url: window.location.href,
            });
          }
        });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Card link copied to clipboard!');
    }
  };

  const handleDownload = useCallback(() => {
    if (!isOwner) return;
    const primaryImage = getPrimaryImageUrl();
    if (primaryImage) {
      const link = document.createElement('a');
      link.download = `${card?.name || 'Monster-Card'}.png`;
      link.href = primaryImage;
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

  const handleCopyEmbed = async () => {
    const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
    const oembed = `${
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com'
    }/api/oembed?url=${encodeURIComponent(pageUrl)}`;
    const iframe = `<iframe src="${
      process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com'
    }/embed/card/${
      card?.id
    }" width="420" height="680" frameborder="0" allowfullscreen loading="lazy" style="max-width:100%;border:0;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,0.15);"></iframe>`;
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
        <Button component={Link} href={backHref} variant="outlined">
          Back to Profile
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO
        title={`${card.name} - Monster Card`}
        description={`Explore ${card.name}, a custom ${card.type}-type monster card.`}
      />

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
              href={backHref}
              variant="text"
              sx={{
                color: 'text.primary',
                '&:hover': {
                  backgroundColor: `${getCardTypeColor(card.type)}20`,
                },
              }}
            >
              Back to Profile
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

              {isOwner && (
                <Tooltip title={'Download Card'}>
                  <IconButton
                    onClick={handleDownload}
                    disabled={!getPrimaryImageUrl()}
                    sx={{
                      color: 'text.primary',
                      '&:hover': {
                        backgroundColor: `${getCardTypeColor(card.type)}20`,
                      },
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              )}
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
        <Stack spacing={3}>
          <Box
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
                <Tooltip title="Toggle Details">
                  <span />
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
                <Box
                  sx={{
                    width: '80%',
                    height: '100%',
                    borderRadius: 3,
                    position: 'absolute',
                    bgcolor: 'rgba(0,0,0,0.05)',
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
                  {cardState ? (
                    <div
                      onClick={handleFullscreenOpen}
                      style={{ cursor: 'pointer' }}
                    >
                      <CardOptionsProvider initialState={cardState}>
                        <CardStylesProvider>
                          <CardDisplay
                            showFrame={true}
                            disableParallax={false}
                          />
                        </CardStylesProvider>
                      </CardOptionsProvider>
                    </div>
                  ) : getPrimaryImageUrl() ? (
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
                        alt={card.name}
                        onLoad={handleImageLoad}
                        onClick={handleFullscreenOpen}
                        decoding="async"
                        fetchPriority="high"
                        style={{
                          width: '100%',
                          height: 'auto',
                          borderRadius: '12px',
                          boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                          objectFit: 'contain',
                          cursor: 'pointer',
                        }}
                      />
                    </picture>
                  ) : null}
                </Box>
              </Zoom>
            </Box>
          </Box>
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
              {isOwner && (
                <IconButton
                  color="inherit"
                  onClick={handleDownload}
                  disabled={!getPrimaryImageUrl()}
                >
                  <DownloadIcon />
                </IconButton>
              )}
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
            {cardState ? (
              <div style={{ transform: 'scale(1.5)' }}>
                <CardOptionsProvider initialState={cardState}>
                  <CardStylesProvider>
                    <CardDisplay showFrame={true} disableParallax={true} />
                  </CardStylesProvider>
                </CardOptionsProvider>
              </div>
            ) : getPrimaryImageUrl() ? (
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
                  alt={card.name}
                  decoding="async"
                  style={{
                    maxWidth: '90vw',
                    maxHeight: '90vh',
                    objectFit: 'contain',
                    borderRadius: '8px',
                  }}
                />
              </picture>
            ) : null}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileCardDetailPage;

'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Chip,
  Fade,
  IconButton,
  Skeleton,
  Tooltip,
  alpha,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { CardData, CardDisplayWrapper } from '@components/CardDisplayWrapper';
import {
  Bolt as BoltIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';

interface AnimatedCard extends CardData {
  animationUrl?: string;
  animationPrompt?: string;
  animatedAt?: string;
  createdAt: string;
  username?: string;
  userAvatar?: string;
  userId?: string;
  isPublic: boolean;
  likesCount: number;
  isLiked: boolean;
  isFollowedUser: boolean;
  rankingScore?: number;
  engagementVelocity?: number;
  contentFreshness?: number;
  creatorAuthority?: number;
}

interface CardDisplayProps {
  card: AnimatedCard;
  onCardClick: () => void;
  onLike?: () => void;
  onShare?: () => void;
  isLiked?: boolean;
  isTrending?: boolean;
  isHighAuthority?: boolean;
}

const CardDisplay: FC<CardDisplayProps> = ({
  card,
  onCardClick,
  onLike,
  onShare,
  isLiked = false,
  isTrending = false,
  isHighAuthority = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const prefersReducedMotion = useMediaQuery(
    '(prefers-reduced-motion: reduce)',
  );

  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [intersectionRatio, setIntersectionRatio] = useState(0);

  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for performance
  useEffect(() => {
    if (!cardRef.current || prefersReducedMotion) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIntersectionRatio(entry.intersectionRatio);
      },
      { threshold: [0, 0.25, 0.5, 0.75, 1] },
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  // Image loading handler
  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true);
    setImageError(false);
  }, []);

  // Accessibility handlers
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onCardClick();
      }
    },
    [onCardClick],
  );

  const handleMouseEnter = useCallback(() => {
    if (!prefersReducedMotion) {
      setIsHovered(true);
    }
  }, [prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const animationDuration = prefersReducedMotion ? 0 : 0.4;

  return (
    <Box
      ref={cardRef}
      sx={{
        position: 'relative',
        opacity: intersectionRatio > 0.1 ? 1 : 0.3,
        transition: `opacity ${animationDuration}s ease`,
      }}
    >
      {/* Card Display Area */}
      <Box
        sx={{
          position: 'relative',
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.grey[50],
            0.8,
          )} 0%, ${alpha(theme.palette.grey[100], 0.4)} 100%)`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          py: { xs: 2.5, sm: 3, md: 4 },
          cursor: 'pointer',
          transition: `all ${animationDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
          overflow: 'hidden',
          borderRadius: { xs: 2, sm: 2.5 },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `radial-gradient(circle at 50% 50%, ${alpha(
              theme.palette.primary.main,
              0.05,
            )} 0%, transparent 70%)`,
            opacity: isHovered ? 1 : 0,
            transition: `opacity ${animationDuration}s ease`,
            pointerEvents: 'none',
          },
          '&:hover': {
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.grey[100],
              0.9,
            )} 0%, ${alpha(theme.palette.grey[200], 0.6)} 100%)`,
            '& .card-wrapper': {
              transform: prefersReducedMotion
                ? 'none'
                : 'translateY(-4px) scale(1.02)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            },
            '& .card-overlay': {
              opacity: 1,
            },
            '& .card-stats': {
              transform: 'translateY(0)',
              opacity: 1,
            },
          },
          '&:active': {
            '& .card-wrapper': {
              transform: prefersReducedMotion
                ? 'none'
                : 'translateY(-2px) scale(1.01)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
            },
          },
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: 2,
          },
        }}
        onClick={onCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={() => setIsPressed(true)}
        onMouseUp={() => setIsPressed(false)}
        onTouchStart={() => setIsPressed(true)}
        onTouchEnd={() => setIsPressed(false)}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`View ${card.name} animated card details`}
      >
        {/* Card Stats Overlay */}
        <Box
          className="card-stats"
          sx={{
            position: 'absolute',
            top: { xs: 8, sm: 12 },
            right: { xs: 8, sm: 12 },
            zIndex: 2,
            opacity: 0,
            transform: 'translateY(-10px)',
            transition: `all ${animationDuration}s ease`,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {isTrending && (
            <Tooltip title="Trending Card - High engagement" arrow>
              <Chip
                icon={<BoltIcon />}
                label="🔥"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.success.main, 0.9),
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.success.main, 1),
                  },
                }}
              />
            </Tooltip>
          )}
          {isHighAuthority && (
            <Tooltip title="High Authority Creator - Verified quality" arrow>
              <Chip
                icon={<StarIcon />}
                label="⭐"
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.warning.main, 0.9),
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '&:hover': {
                    bgcolor: alpha(theme.palette.warning.main, 1),
                  },
                }}
              />
            </Tooltip>
          )}
        </Box>

        {/* Card Wrapper */}
        <Box
          className="card-wrapper"
          sx={{
            width: {
              xs: '92%',
              sm: '88%',
              md: '360px',
            },
            maxWidth: { xs: 340, sm: 360, md: 420 },
            aspectRatio: '747/1038',
            position: 'relative',
            mx: 'auto',
            transition: `all ${animationDuration}s cubic-bezier(0.4, 0, 0.2, 1)`,
            borderRadius: { xs: 2.5, sm: 3, md: 4 },
            overflow: 'hidden',
            boxShadow: isPressed
              ? '0 8px 24px rgba(0,0,0,0.15)'
              : '0 12px 32px rgba(0,0,0,0.12)',
            touchAction: 'manipulation',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(45deg, transparent 30%, ${alpha(
                theme.palette.common.white,
                0.1,
              )} 50%, transparent 70%)`,
              transform: 'translateX(-100%)',
              transition: `transform ${animationDuration * 1.5}s ease`,
              zIndex: 1,
              pointerEvents: 'none',
            },
            '&:hover::before': {
              transform: prefersReducedMotion ? 'none' : 'translateX(100%)',
            },
          }}
        >
          {/* Loading Skeleton */}
          {!isImageLoaded && !imageError && (
            <Skeleton
              variant="rectangular"
              width="100%"
              height="100%"
              sx={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
            />
          )}

          {/* Error State */}
          {imageError && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme.palette.grey[100],
                zIndex: 1,
              }}
            >
              <Alert severity="error" sx={{ m: 2 }}>
                Failed to load card image
              </Alert>
            </Box>
          )}

          <CardDisplayWrapper
            card={card}
            showFrame={true}
            disableParallax={isMobile || prefersReducedMotion}
            width="responsive"
            onLoad={handleImageLoad}
          />

          {/* Card Overlay with Quick Actions */}
          <Box
            className="card-overlay"
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(180deg, ${alpha(
                theme.palette.common.black,
                0.3,
              )} 0%, transparent 30%, transparent 70%, ${alpha(
                theme.palette.common.black,
                0.3,
              )} 100%)`,
              opacity: 0,
              transition: `opacity ${animationDuration}s ease`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2,
            }}
          >
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Tooltip title="View details" arrow>
                <IconButton
                  onClick={e => {
                    e.stopPropagation();
                    onCardClick();
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.common.white, 0.9),
                    color: theme.palette.text.primary,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 1),
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                  aria-label="View card details"
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>

              {onShare && (
                <Tooltip title="Share card" arrow>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      onShare();
                    }}
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      color: theme.palette.text.primary,
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 1),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                    aria-label="Share card"
                  >
                    <ShareIcon />
                  </IconButton>
                </Tooltip>
              )}

              {onLike && (
                <Tooltip title={isLiked ? 'Unlike' : 'Like'} arrow>
                  <IconButton
                    onClick={e => {
                      e.stopPropagation();
                      onLike();
                    }}
                    sx={{
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      color: isLiked
                        ? theme.palette.error.main
                        : theme.palette.text.primary,
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 1),
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={isLiked ? 'Unlike card' : 'Like card'}
                  >
                    <FavoriteIcon />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        {/* Floating Action Indicator */}
        <Fade in={isHovered} timeout={300}>
          <Box
            sx={{
              position: 'absolute',
              bottom: { xs: 8, sm: 12 },
              left: '50%',
              transform: 'translateX(-50%)',
              bgcolor: alpha(theme.palette.common.black, 0.8),
              color: 'white',
              px: 2,
              py: 0.5,
              borderRadius: 2,
              fontSize: '0.75rem',
              fontWeight: 500,
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              zIndex: 2,
            }}
          >
            Click to view details
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default CardDisplay;

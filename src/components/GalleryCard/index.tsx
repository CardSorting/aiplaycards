'use client';

import { FC, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Collapse,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import {
  ChatBubbleOutline as CommentIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Share as ShareIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { CardData } from '@components/CardDisplayWrapper';

interface GalleryCardProps {
  card: CardData;
  onShare?: (card: CardData) => void;
  socialMode?: boolean;
  onCardClick?: (card: CardData) => void;
  detailsHrefOverride?: string;
}

const GalleryCard: FC<GalleryCardProps> = ({
  card,
  onShare,
  socialMode = false,
  onCardClick,
  detailsHrefOverride,
}) => {
  const theme = useTheme();
  const router = useRouter();
  const user = null; // For now, we'll assume no user session

  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [commentsOpen, setCommentsOpen] = useState<boolean>(false);
  const [loadingComments, setLoadingComments] = useState<boolean>(false);
  const [comments, setComments] = useState<
    Array<{ id: number; userId: string; content: string; createdAt: string }>
  >([]);
  const [newComment, setNewComment] = useState<string>('');

  // Load likes when social mode
  useEffect(() => {
    let active = true;
    async function loadLikes() {
      if (!socialMode) return;
      try {
        const res = await fetch(`/api/cards/${card.id}/likes`);
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setLikesCount(data?.data?.count || 0);
        setIsLiked(Boolean(data?.data?.isLiked));
      } catch (error) {
        console.error('Failed to load likes:', error);
      }
    }
    loadLikes();
    return () => {
      active = false;
    };
  }, [card.id, socialMode]);

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (onShare) {
      onShare(card);
    }
  };

  const handleCardClick = () => {
    if (onCardClick) return onCardClick(card);
    if (detailsHrefOverride) return router.push(detailsHrefOverride);
    router.push(`/gallery/${card.id}`);
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    if (detailsHrefOverride) return router.push(detailsHrefOverride);
    router.push(`/gallery/${card.id}`);
  };

  const toggleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return; // Don't allow liking without authentication
    try {
      const action = isLiked ? 'unlike' : 'like';
      const res = await fetch(`/api/cards/${card.id}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setLikesCount(data?.data?.count || 0);
      setIsLiked(Boolean(data?.data?.isLiked));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const loadComments = async () => {
    try {
      setLoadingComments(true);
      const res = await fetch(`/api/cards/${card.id}/comments?limit=20`);
      if (!res.ok) return;
      const data = await res.json();
      setComments(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const toggleComments = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !commentsOpen;
    setCommentsOpen(next);
    if (next && comments.length === 0) {
      await loadComments();
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;
    try {
      const res = await fetch(`/api/cards/${card.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment.trim() }),
      });
      if (!res.ok) return;
      setNewComment('');
      await loadComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12],
        },
        overflow: 'visible',
      }}
    >
      {/* Card Display Container */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          backgroundColor: '#f8f9fa',
        }}
      >
        <Box
          sx={{
            width: 200,
            maxWidth: 200,
            aspectRatio: '747/1038',
            position: 'relative',
          }}
        >
          {/* Card image display */}
          {(() => {
            // Determine the best image source for this card
            const imageSrc =
              (card as any).primaryImage ||
              card.imageData?.dataUrl ||
              (card.imageData?.generated &&
                Array.isArray(card.imageData.generated) &&
                card.imageData.generated[0]) ||
              (card.imageData?.thumbs &&
                Array.isArray(card.imageData.thumbs) &&
                card.imageData.thumbs[0]);

            if (imageSrc) {
              return (
                <Box
                  component="img"
                  src={imageSrc}
                  alt={`${card.name} card`}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    borderRadius: 1,
                    border: '2px solid',
                    borderColor: 'primary.main',
                  }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    // Fallback to placeholder if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      const fallback = document.createElement('div');
                      fallback.style.width = '100%';
                      fallback.style.height = '100%';
                      fallback.style.backgroundColor = '#f5f5f5';
                      fallback.style.borderRadius = '4px';
                      fallback.style.display = 'flex';
                      fallback.style.alignItems = 'center';
                      fallback.style.justifyContent = 'center';
                      fallback.style.border = '2px solid #1976d2';
                      fallback.innerHTML = `<span style="font-size: 0.875rem; color: #666;">${card.name}</span>`;
                      parent.appendChild(fallback);
                    }
                  }}
                />
              );
            }

            // Fallback placeholder when no image is available
            return (
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  borderColor: 'primary.main',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {card.name}
                </Typography>
              </Box>
            );
          })()}
        </Box>
      </Box>

      {/* Card Info */}
      <CardContent sx={{ flexGrow: 1, pt: 1 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {card.name}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={card.supertype}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            label={card.type}
            size="small"
            color="secondary"
            variant="outlined"
          />
          {card.subtype && (
            <Chip label={card.subtype} size="small" variant="outlined" />
          )}
          <Chip
            label={card.isPublic ? 'Public' : 'Private'}
            size="small"
            color={card.isPublic ? 'success' : 'default'}
            variant={card.isPublic ? 'filled' : 'outlined'}
          />
          {card.rarity && (
            <Chip
              label={`Rarity: ${card.rarity}`}
              size="small"
              color={card.rarity === 'Character Rare' ? 'error' : 'default'}
              variant="outlined"
            />
          )}
        </Box>

        {card.hitpoints && (
          <Typography variant="body2" color="text.secondary">
            HP: {card.hitpoints}
          </Typography>
        )}

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mt: 1 }}
        >
          Created:{' '}
          {card.createdAt
            ? new Date(card.createdAt).toLocaleDateString()
            : 'N/A'}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions
        sx={{
          pt: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ width: '100%' }}
        >
          <Button
            size="small"
            onClick={handleViewDetails}
            startIcon={<VisibilityIcon />}
            variant="contained"
            fullWidth
            sx={{ mr: 1 }}
          >
            View Details
          </Button>
          {socialMode ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton
                onClick={toggleLike}
                color={isLiked ? 'error' : 'default'}
                size="small"
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" color="text.secondary">
                {likesCount}
              </Typography>
              <IconButton
                onClick={toggleComments}
                size="small"
                color={commentsOpen ? 'primary' : 'default'}
              >
                <CommentIcon />
              </IconButton>
            </Stack>
          ) : (
            <Tooltip title="Share Card">
              <IconButton onClick={handleShare} color="primary" size="small">
                <ShareIcon />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {socialMode && (
          <Collapse in={commentsOpen} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1} sx={{ width: '100%' }}>
              {loadingComments ? (
                <Typography variant="body2" color="text.secondary">
                  Loading comments…
                </Typography>
              ) : comments.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No comments yet
                </Typography>
              ) : (
                comments.map(c => (
                  <Box
                    key={c.id}
                    sx={{ p: 1, backgroundColor: '#f8f9fa', borderRadius: 1 }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {c.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(c.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                ))
              )}
              <Box
                component="form"
                onSubmit={submitComment}
                sx={{ display: 'flex', gap: 1 }}
              >
                <TextField
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  size="small"
                  placeholder={user ? 'Add a comment...' : 'Sign in to comment'}
                  fullWidth
                  disabled={!user}
                />
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={!user || !newComment.trim()}
                >
                  Post
                </Button>
              </Box>
            </Stack>
          </Collapse>
        )}
      </CardActions>
    </Card>
  );
};

export default GalleryCard;

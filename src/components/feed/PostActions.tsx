'use client';

import { FC } from 'react';
import { Avatar, Box, IconButton, Stack, Typography } from '@mui/material';
import {
  BookmarkBorder as BookmarkBorderIcon,
  Bookmark as BookmarkIcon,
  ChatBubbleOutline as CommentIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Favorite as FavoriteIcon,
  Send as SendIcon,
} from '@mui/icons-material';

interface PostActionsProps {
  likesCount: number;
  isLiked: boolean;
  isLikeLoading: boolean;
  onLike: () => void;
  onShare: () => void;
  onComment?: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  isFollowing?: boolean;
}

const PostActions: FC<PostActionsProps> = ({
  likesCount,
  isLiked,
  isLikeLoading,
  onLike,
  onShare,
  onComment,
  onBookmark,
  isBookmarked = false,
  isFollowing = false,
}) => {
  return (
    <Box sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 } }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: { xs: 1.5, sm: 2 } }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 0.5, sm: 1 }}>
          <IconButton
            onClick={onLike}
            disabled={isLikeLoading}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              color: isLiked ? '#ed4956' : 'grey.600',
              opacity: isLikeLoading ? 0.6 : 1,
              minWidth: { xs: 44, sm: 48 }, // Better touch target
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                bgcolor: isLiked ? 'rgba(237, 73, 86, 0.1)' : 'grey.100',
                transform: !isLikeLoading ? 'scale(1.05)' : 'none',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isLiked ? (
              <FavoriteIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            ) : (
              <FavoriteBorderIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            )}
          </IconButton>

          {onComment && (
            <IconButton
              onClick={onComment}
              sx={{
                p: { xs: 1.25, sm: 1.5 },
                color: 'grey.600',
                minWidth: { xs: 44, sm: 48 },
                minHeight: { xs: 44, sm: 48 },
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'scale(1.05)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <CommentIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            </IconButton>
          )}

          <IconButton
            onClick={onShare}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              color: 'grey.600',
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <SendIcon
              sx={{
                fontSize: { xs: 20, sm: 22 },
                transform: 'rotate(-45deg)',
              }}
            />
          </IconButton>
        </Stack>

        {onBookmark && (
          <IconButton
            onClick={onBookmark}
            sx={{
              p: { xs: 1.25, sm: 1.5 },
              color: 'grey.600',
              minWidth: { xs: 44, sm: 48 },
              minHeight: { xs: 44, sm: 48 },
              '&:hover': {
                bgcolor: 'grey.100',
                transform: 'scale(1.05)',
              },
              '&:active': {
                transform: 'scale(0.95)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            {isBookmarked ? (
              <BookmarkIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            ) : (
              <BookmarkBorderIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            )}
          </IconButton>
        )}
      </Stack>

      {/* Likes Section */}
      {likesCount > 0 && (
        <Stack
          direction="row"
          alignItems="center"
          spacing={{ xs: 0.75, sm: 1 }}
          sx={{ mb: { xs: 1, sm: 1.5 } }}
        >
          <Stack
            direction="row"
            spacing={{ xs: -0.25, sm: -0.5 }}
            sx={{ flexShrink: 0 }}
          >
            {/* Avatar indicators for likers */}
            {[1, 2, 3].slice(0, Math.min(3, likesCount)).map(i => (
              <Avatar
                key={i}
                sx={{
                  width: { xs: 18, sm: 20 },
                  height: { xs: 18, sm: 20 },
                  border: '2px solid white',
                  fontSize: { xs: '0.6rem', sm: '0.7rem' },
                  bgcolor: 'primary.main',
                }}
              >
                {String.fromCharCode(65 + i)}
              </Avatar>
            ))}
          </Stack>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              fontSize: { xs: '0.875rem', sm: '1rem' },
              lineHeight: 1.2,
            }}
          >
            {likesCount === 1 ? (
              <span>
                <strong>1</strong> like
              </span>
            ) : (
              <span>
                <strong>{likesCount}</strong> likes
              </span>
            )}
            {isFollowing && (
              <Typography
                component="span"
                color="text.secondary"
                sx={{
                  ml: { xs: 0.5, sm: 1 },
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                }}
              >
                • Following
              </Typography>
            )}
          </Typography>
        </Stack>
      )}
    </Box>
  );
};

export default PostActions;

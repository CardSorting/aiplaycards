'use client';

import { FC } from 'react';
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';

interface PostHeaderProps {
  username: string;
  userAvatar?: string;
  userId?: string;
  currentUserId?: string;
  isFollowing: boolean;
  isFollowLoading: boolean;
  onFollow: () => void;
  animatedAt?: string;
  createdAt: string;
  hasAnimation?: boolean;
  engagementVelocity?: number;
  creatorAuthority?: number;
}

const PostHeader: FC<PostHeaderProps> = ({
  username,
  userAvatar,
  createdAt,
  creatorAuthority,
  currentUserId,
  userId,
  isFollowing,
  isFollowLoading,
  onFollow,
}) => {
  const timeAgo = (date: string) => {
    const now = new Date();
    const cardDate = new Date(date);
    const diffInHours = Math.floor(
      (now.getTime() - cardDate.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const canFollow = currentUserId && userId && currentUserId !== userId;

  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 2.5 },
        borderBottom: '1px solid',
        borderColor: 'grey.100',
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 2.5 }}>
          <Avatar
            sx={{
              width: { xs: 40, sm: 44 },
              height: { xs: 40, sm: 44 },
              border: '2px solid',
              borderColor: 'grey.200',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              flexShrink: 0,
            }}
            src={userAvatar}
          >
            <Typography
              sx={{
                fontWeight: 600,
                fontSize: { xs: '1rem', sm: '1.1rem' },
              }}
            >
              {(username || 'U')[0].toUpperCase()}
            </Typography>
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={{ xs: 0.5, sm: 1.5 }}
              sx={{ mb: { xs: 0.5, sm: 0.25 } }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={{ xs: 1, sm: 1.5 }}
                sx={{ flexWrap: 'wrap' }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '0.95rem' },
                    color: 'text.primary',
                    lineHeight: 1.2,
                  }}
                >
                  {username || 'Anonymous'}
                </Typography>
                {creatorAuthority && creatorAuthority > 10 && (
                  <Tooltip title="High Authority Creator">
                    <Chip
                      label="⭐"
                      size="small"
                      sx={{
                        bgcolor: 'warning.main',
                        color: 'white',
                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                        height: { xs: 20, sm: 24 },
                      }}
                    />
                  </Tooltip>
                )}
                {canFollow && (
                  <Box
                    component="button"
                    onClick={onFollow}
                    disabled={isFollowLoading}
                    sx={{
                      border: '1px solid',
                      borderColor: isFollowing ? 'grey.300' : 'primary.main',
                      borderRadius: { xs: 1.5, sm: 2 },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.25, sm: 0.5 },
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                      fontWeight: 600,
                      bgcolor: isFollowing ? 'grey.50' : 'primary.main',
                      color: isFollowing ? 'grey.700' : 'white',
                      cursor: isFollowLoading ? 'not-allowed' : 'pointer',
                      opacity: isFollowLoading ? 0.6 : 1,
                      minHeight: { xs: 28, sm: 32 }, // Better touch target
                      '&:hover': {
                        bgcolor: isFollowing ? 'grey.100' : 'primary.dark',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </Box>
                )}
              </Stack>
            </Stack>
            <Stack
              direction="row"
              alignItems="center"
              spacing={{ xs: 0.5, sm: 1 }}
              sx={{
                flexWrap: 'wrap',
                gap: { xs: 0.25, sm: 0.5 },
              }}
            >
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  lineHeight: 1.2,
                }}
              >
                {timeAgo(createdAt)}
              </Typography>
              {creatorAuthority && creatorAuthority > 10 && (
                <>
                  <Box
                    sx={{
                      width: { xs: 1.5, sm: 2 },
                      height: { xs: 1.5, sm: 2 },
                      borderRadius: '50%',
                      bgcolor: 'warning.main',
                    }}
                  />
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'white',
                      fontWeight: 500,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  >
                    High Authority
                  </Typography>
                </>
              )}
            </Stack>
          </Box>
        </Stack>
        <IconButton
          size="small"
          sx={{
            color: 'grey.500',
            p: { xs: 1, sm: 1.5 },
            minWidth: { xs: 40, sm: 44 }, // Better touch target
            minHeight: { xs: 40, sm: 44 },
            '&:hover': {
              bgcolor: 'grey.100',
              color: 'grey.700',
            },
          }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default PostHeader;

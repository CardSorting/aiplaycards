'use client';

import { FC } from 'react';
import {
  Box,
  Chip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
  People as PeopleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';

type SortOption = 'ranked' | 'latest' | 'trending' | 'following';

interface FeedHeaderProps {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  cardsCount: number;
  animatedCount: number;
  creatorsCount: number;
  totalLikes: number;
  cacheHitRate?: string;
}

const FeedHeader: FC<FeedHeaderProps> = ({
  sortBy,
  onSortChange,
  cardsCount,
  animatedCount,
  creatorsCount,
  totalLikes,
  cacheHitRate,
}) => {
  const { data: session } = useSession();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
      {/* Feed Title */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={{ xs: 1.5, sm: 2 }}
        sx={{ mb: { xs: 2, sm: 3 } }}
      >
        <Box
          sx={{
            width: { xs: 40, sm: 48 },
            height: { xs: 40, sm: 48 },
            borderRadius: { xs: 2, sm: 3 },
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
            ✨
          </Typography>
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2.125rem' },
              letterSpacing: '-0.02em',
              mb: { xs: 0.25, sm: 0.5 },
              lineHeight: { xs: 1.2, sm: 1.3 },
            }}
          >
            Social Feed
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              fontSize: { xs: '0.875rem', sm: '1rem' },
              fontWeight: 400,
              opacity: 0.8,
              lineHeight: 1.4,
            }}
          >
            Latest animated cards from the community
          </Typography>
        </Box>
      </Stack>

      {/* Sorting Controls */}
      <Box sx={{ mb: { xs: 2, sm: 3 } }}>
        <ToggleButtonGroup
          value={sortBy}
          exclusive
          onChange={(_, newSort) => newSort && onSortChange(newSort)}
          aria-label="feed sorting"
          sx={{
            width: '100%',
            '& .MuiToggleButton-root': {
              textTransform: 'none',
              fontWeight: 600,
              px: { xs: 1.5, sm: 2, md: 3 },
              py: { xs: 1, sm: 1.25, md: 1.5 },
              borderRadius: { xs: 1.5, sm: 2 },
              border: '1px solid',
              borderColor: 'grey.300',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 44, sm: 48 }, // Better touch targets
              flex: { xs: 1, sm: 'none' },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'white',
                borderColor: 'primary.main',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
              '&:hover': {
                bgcolor: 'grey.100',
              },
            },
          }}
        >
          <ToggleButton value="ranked" aria-label="ranked">
            <AutoAwesomeIcon
              sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}
            />
            {!isMobile && 'For You'}
            {isMobile && 'For You'}
          </ToggleButton>
          <ToggleButton value="latest" aria-label="latest">
            <ScheduleIcon
              sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}
            />
            {!isMobile && 'Latest'}
            {isMobile && 'Latest'}
          </ToggleButton>
          <ToggleButton value="trending" aria-label="trending">
            <TrendingUpIcon
              sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}
            />
            {!isMobile && 'Trending'}
            {isMobile && 'Trending'}
          </ToggleButton>
          {session?.user && (
            <ToggleButton value="following" aria-label="following">
              <PeopleIcon
                sx={{ mr: { xs: 0.5, sm: 1 }, fontSize: { xs: 16, sm: 18 } }}
              />
              {!isMobile && 'Following'}
              {isMobile && 'Following'}
            </ToggleButton>
          )}
        </ToggleButtonGroup>
      </Box>

      {/* Stats Bar */}
      <Box
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderRadius: { xs: 1.5, sm: 2 },
          bgcolor: 'grey.50',
          border: '1px solid',
          borderColor: 'grey.200',
          mb: { xs: 3, sm: 4 },
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={{ xs: 2, sm: 3 }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 1, sm: 2 }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' },
              }}
            >
              {cardsCount > 0
                ? `${cardsCount} animated cards`
                : 'Loading feed...'}
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                flexWrap: 'wrap',
                gap: { xs: 0.5, sm: 1 },
              }}
            >
              {sortBy === 'ranked' && (
                <Chip
                  label="AI Ranked"
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<AutoAwesomeIcon />}
                  sx={{
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    height: { xs: 24, sm: 28 },
                  }}
                />
              )}

              {cacheHitRate && (
                <Tooltip title="Engagement Analytics">
                  <Chip
                    label={
                      <AnalyticsIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                    }
                    size="small"
                    color="secondary"
                    variant="outlined"
                    sx={{
                      height: { xs: 24, sm: 28 },
                    }}
                  />
                </Tooltip>
              )}
            </Stack>
          </Stack>

          <Stack
            direction="row"
            spacing={{ xs: 1.5, sm: 2 }}
            sx={{
              justifyContent: { xs: 'space-between', sm: 'flex-end' },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: -0.5,
                }}
              >
                {animatedCount}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Animated
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: -0.5,
                }}
              >
                {creatorsCount}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Creators
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'center', flex: 1 }}>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  mb: -0.5,
                }}
              >
                {totalLikes}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
              >
                Total Likes
              </Typography>
            </Box>
            {cacheHitRate && (
              <Box sx={{ textAlign: 'center', flex: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    mb: -0.5,
                  }}
                >
                  {cacheHitRate}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  Cache Hit Rate
                </Typography>
              </Box>
            )}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default FeedHeader;

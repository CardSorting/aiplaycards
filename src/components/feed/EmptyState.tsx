'use client';

import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface EmptyStateProps {
  sortBy: string;
}

const EmptyState: FC<EmptyStateProps> = ({ sortBy }) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 6, sm: 8 },
        px: { xs: 2, sm: 3 },
        borderRadius: { xs: 2, sm: 4 },
        border: '2px dashed',
        borderColor: 'grey.300',
        bgcolor: 'grey.50',
        mx: { xs: 1, sm: 0 },
      }}
    >
      <Box
        sx={{
          width: { xs: 60, sm: 80 },
          height: { xs: 60, sm: 80 },
          borderRadius: '50%',
          bgcolor: 'primary.main',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: { xs: 2, sm: 3 },
          opacity: 0.1,
        }}
      >
        <Typography sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          ✨
        </Typography>
      </Box>
      <Typography
        variant="h5"
        gutterBottom
        sx={{
          fontWeight: 700,
          mb: { xs: 0.5, sm: 1 },
          color: 'text.primary',
          fontSize: { xs: '1.25rem', sm: '1.5rem' },
          lineHeight: { xs: 1.3, sm: 1.4 },
        }}
      >
        {sortBy === 'following'
          ? 'No content from followed creators'
          : 'No animated cards yet'}
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{
          fontSize: { xs: '0.875rem', sm: '1.1rem' },
          maxWidth: { xs: 300, sm: 400 },
          mx: 'auto',
          lineHeight: { xs: 1.5, sm: 1.6 },
        }}
      >
        {sortBy === 'following'
          ? 'Follow some creators to see their latest animated cards here!'
          : 'Be the first to animate a card and see it featured in the community feed!'}
      </Typography>
    </Box>
  );
};

export default EmptyState;

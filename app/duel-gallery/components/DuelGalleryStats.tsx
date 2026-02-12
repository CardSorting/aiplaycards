'use client';

import { Box, Stack, Typography } from '@mui/material';

interface DuelGalleryStatsProps {
  stats: {
    total: number;
    thisMonth: number;
    mostLiked: string;
  };
}

export const DuelGalleryStats = ({ stats }: DuelGalleryStatsProps) => {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={{ xs: 1, sm: 2 }}
      sx={{
        minWidth: { lg: 400 },
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          bgcolor: 'rgba(138, 43, 226, 0.1)',
          border: '1px solid rgba(138, 43, 226, 0.2)',
          minWidth: { xs: 'auto', sm: 100 },
          flex: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#8A2BE2',
            fontSize: { xs: '1.8rem', sm: '3rem' },
          }}
        >
          {stats.total}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            mt: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Total Cards
        </Typography>
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          bgcolor: 'rgba(75, 0, 130, 0.1)',
          border: '1px solid rgba(75, 0, 130, 0.2)',
          minWidth: { xs: 'auto', sm: 100 },
          flex: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#4B0082',
            fontSize: { xs: '1.8rem', sm: '3rem' },
          }}
        >
          {stats.thisMonth}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            mt: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          This Month
        </Typography>
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          bgcolor: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          minWidth: { xs: 'auto', sm: 120 },
          flex: 1,
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 800,
            color: '#DAA520',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            wordBreak: 'break-word',
            hyphens: 'auto',
          }}
          noWrap={false}
        >
          {stats.mostLiked}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontWeight: 600,
            mt: 0.5,
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
          }}
        >
          Most Liked
        </Typography>
      </Box>
    </Stack>
  );
};

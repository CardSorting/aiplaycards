'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { DuelGalleryStats } from './DuelGalleryStats';

interface DuelGalleryHeaderProps {
  stats: {
    total: number;
    thisMonth: number;
    mostLiked: string;
  };
  showStats: boolean;
}

export const DuelGalleryHeader = ({
  stats,
  showStats,
}: DuelGalleryHeaderProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 3,
        borderRadius: 3,
        background:
          'linear-gradient(135deg, rgba(138, 43, 226, 0.1) 0%, rgba(75, 0, 130, 0.1) 100%)',
        border: '1px solid rgba(138, 43, 226, 0.2)',
      }}
    >
      <Stack
        direction={{ xs: 'column', lg: 'row' }}
        spacing={{ xs: 3, lg: 4 }}
        alignItems={{ xs: 'flex-start', lg: 'center' }}
      >
        <Box sx={{ flex: 1, width: '100%' }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 700,
              background: 'linear-gradient(45deg, #8A2BE2, #4B0082)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            My Duel Gallery
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Your personal collection of custom duel cards
          </Typography>
        </Box>

        {showStats && <DuelGalleryStats stats={stats} />}
      </Stack>
    </Paper>
  );
};

'use client';

import { Box, Paper, Stack, Typography } from '@mui/material';
import { SpecialCollectionStats } from './SpecialCollectionStats';

interface SpecialCollectionHeaderProps {
  stats: {
    totalCards: number;
    totalPacks: number;
    categoriesCount: number;
    recentClaimsCount: number;
  };
  showStats: boolean;
  statsLoading?: boolean;
}

export const SpecialCollectionHeader = ({
  stats,
  showStats,
  statsLoading,
}: SpecialCollectionHeaderProps) => {
  return (
    <Paper
      elevation={1}
      sx={{
        p: { xs: 3, sm: 4 },
        mb: 3,
        borderRadius: 3,
        background:
          'linear-gradient(135deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 140, 0, 0.1) 100%)',
        border: '1px solid rgba(255, 215, 0, 0.2)',
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
              background: 'linear-gradient(45deg, #FFD700, #FF8C00)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
            }}
          >
            ✨ Special Collection
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', sm: '1.25rem' },
            }}
          >
            Your exclusive collection of claimed PlayMore packs and premium
            cards
          </Typography>
        </Box>

        {showStats && (
          <SpecialCollectionStats stats={stats} loading={statsLoading} />
        )}
      </Stack>
    </Paper>
  );
};

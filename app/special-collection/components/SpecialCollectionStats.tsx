'use client';

import { Box, Stack, Typography } from '@mui/material';

interface SpecialCollectionStatsProps {
  stats: {
    totalCards: number;
    totalPacks: number;
    categoriesCount: number;
    recentClaimsCount: number;
  };
  loading?: boolean;
}

export const SpecialCollectionStats = ({
  stats,
  loading,
}: SpecialCollectionStatsProps) => {
  if (loading) {
    return (
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={{ xs: 1, sm: 2 }}
        sx={{
          minWidth: { lg: 400 },
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {[1, 2, 3].map(index => (
          <Box
            key={index}
            sx={{
              textAlign: 'center',
              p: { xs: 2, sm: 2.5 },
              borderRadius: 2,
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
              minWidth: { xs: 'auto', sm: 100 },
              flex: 1,
              height: { xs: 60, sm: 80 },
            }}
          >
            <Box
              sx={{
                width: '60%',
                height: '60%',
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 1,
                mx: 'auto',
                mb: 1,
              }}
            />
            <Box
              sx={{
                width: '80%',
                height: 16,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                borderRadius: 1,
                mx: 'auto',
              }}
            />
          </Box>
        ))}
      </Stack>
    );
  }

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
          bgcolor: 'rgba(255, 215, 0, 0.1)',
          border: '1px solid rgba(255, 215, 0, 0.2)',
          minWidth: { xs: 'auto', sm: 100 },
          flex: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#FFD700',
            fontSize: { xs: '1.8rem', sm: '3rem' },
          }}
        >
          {stats.totalCards}
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
          Special Cards
        </Typography>
      </Box>

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
          {stats.categoriesCount}
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
          Categories
        </Typography>
      </Box>

      <Box
        sx={{
          textAlign: 'center',
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          bgcolor: 'rgba(255, 140, 0, 0.1)',
          border: '1px solid rgba(255, 140, 0, 0.2)',
          minWidth: { xs: 'auto', sm: 120 },
          flex: 1,
        }}
      >
        <Typography
          variant="h3"
          sx={{
            fontWeight: 800,
            color: '#FF8C00',
            fontSize: { xs: '1.8rem', sm: '3rem' },
          }}
        >
          {stats.recentClaimsCount}
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
          Recent Claims
        </Typography>
      </Box>
    </Stack>
  );
};

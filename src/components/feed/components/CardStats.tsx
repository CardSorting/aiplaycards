'use client';

import { FC, useMemo } from 'react';
import { Box, Chip, useTheme } from '@mui/material';

interface CardStatsProps {
  type: string;
  rarity?: string;
  hitpoints?: number;
}

const CardStats: FC<CardStatsProps> = ({ type, rarity, hitpoints }) => {
  const theme = useTheme();

  const typeColor = useMemo(() => {
    const typeColors: Record<string, string> = {
      fire: '#ff6b35',
      water: '#4ecdc4',
      grass: '#45b7d1',
      electric: '#ffe66d',
      psychic: '#a8e6cf',
      fighting: '#ff8a80',
      darkness: '#6c5ce7',
      metal: '#a29bfe',
      fairy: '#fd79a8',
      dragon: '#e17055',
      normal: '#b2bec3',
    };
    return typeColors[type?.toLowerCase()] || theme.palette.primary.main;
  }, [type, theme.palette.primary.main]);

  const rarityColor = useMemo(() => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return theme.palette.warning.main;
      case 'rare':
        return theme.palette.info.main;
      case 'uncommon':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  }, [rarity, theme.palette]);

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(auto-fit, minmax(80px, 1fr))',
          sm: 'repeat(auto-fit, minmax(100px, 1fr))',
        },
        gap: { xs: 1, sm: 1.5 },
        mb: { xs: 2, sm: 2.5 },
      }}
    >
      <Chip
        label={type}
        size="small"
        sx={{
          bgcolor: typeColor,
          color: 'white',
          fontWeight: 600,
          fontSize: { xs: '0.7rem', sm: '0.75rem' },
          height: { xs: 28, sm: 32 },
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          transition: 'all 0.2s ease',
        }}
        aria-label={`Card type: ${type}`}
      />
      {rarity && (
        <Chip
          label={rarity}
          size="small"
          sx={{
            bgcolor: rarityColor,
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            height: { xs: 28, sm: 32 },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label={`Card rarity: ${rarity}`}
        />
      )}
      {hitpoints && (
        <Chip
          label={`${hitpoints} HP`}
          size="small"
          sx={{
            bgcolor: theme.palette.error.main,
            color: 'white',
            fontWeight: 600,
            fontSize: { xs: '0.7rem', sm: '0.75rem' },
            height: { xs: 28, sm: 32 },
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
            transition: 'all 0.2s ease',
          }}
          aria-label={`Hit points: ${hitpoints}`}
        />
      )}
    </Box>
  );
};

export default CardStats;

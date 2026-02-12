'use client';

import { FC, useMemo } from 'react';
import { Box, Chip, Typography, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface CardDescriptionProps {
  name: string;
  description?: string;
  cardNumber?: string;
  totalInSet?: number;
}

const CardDescription: FC<CardDescriptionProps> = ({
  name,
  description,
  cardNumber,
  totalInSet,
}) => {
  const theme = useTheme();

  const isHighAuthority = useMemo(() => {
    // This would be calculated based on creator metrics
    return false;
  }, []);

  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
      {/* Card Name with Gradient Effect */}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.4rem' },
          mb: 1,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textShadow: '0 2px 4px rgba(0,0,0,0.1)',
          lineHeight: 1.2,
        }}
      >
        {name}
      </Typography>

      {/* Card Description */}
      {description && (
        <Typography
          variant="body2"
          sx={{
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            color: theme.palette.text.secondary,
            lineHeight: 1.5,
            mb: 2,
            wordBreak: 'break-word',
          }}
        >
          {description}
        </Typography>
      )}

      {/* Additional Info Chips */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mb: 1,
        }}
      >
        {cardNumber && (
          <Chip
            label={`#${cardNumber}`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.info.main, 0.1),
              color: theme.palette.info.main,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 600,
              height: { xs: 24, sm: 28 },
              '&:hover': {
                bgcolor: alpha(theme.palette.info.main, 0.2),
              },
            }}
            aria-label={`Card number: ${cardNumber}`}
          />
        )}
        {totalInSet && (
          <Chip
            label={`Set: ${totalInSet} cards`}
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontSize: { xs: '0.7rem', sm: '0.75rem' },
              fontWeight: 600,
              height: { xs: 24, sm: 28 },
              '&:hover': {
                bgcolor: alpha(theme.palette.success.main, 0.2),
              },
            }}
            aria-label={`Total cards in set: ${totalInSet}`}
          />
        )}
      </Box>

      {/* Status Indicators */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          opacity: 0.8,
        }}
      >
        {/* isTrending prop was removed from interface, so this will be removed */}
        {isHighAuthority && (
          <Chip
            label="⭐ Verified"
            size="small"
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontSize: { xs: '0.65rem', sm: '0.7rem' },
              fontWeight: 600,
              height: { xs: 20, sm: 24 },
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default CardDescription;

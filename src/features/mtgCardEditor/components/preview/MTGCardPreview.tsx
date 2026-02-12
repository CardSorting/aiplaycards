'use client';

import React from 'react';
import { Box, Fab, Tooltip, Typography } from '@mui/material';
import { Refresh } from '@mui/icons-material';
import { MTGCardRenderer } from './MTGCardRenderer';
import { useMTGCard } from '../../contexts/MTGCardContext';

export function MTGCardPreview() {
  const { state, resetCard } = useMTGCard();
  const { card, validation } = state;

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        py: 2,
      }}
    >
      {/* Card Display */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '560px',
          overflow: 'visible',
          position: 'relative',
          py: 2,
        }}
      >
        <MTGCardRenderer />
      </Box>

      {/* Preview Controls - Only Reset Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mt: 2,
        }}
      >
        <Tooltip title="Reset Card">
          <Fab
            size="small"
            onClick={resetCard}
            sx={{
              backgroundColor: 'rgba(255,255,255,0.9)',
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
            }}
          >
            <Refresh />
          </Fab>
        </Tooltip>
      </Box>

      {/* Card Info */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 1,
          mt: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: 'rgba(255,255,255,0.9)',
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {card.name || 'Untitled Card'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: validation.isValid
              ? 'rgba(76, 175, 80, 0.9)'
              : 'rgba(244, 67, 54, 0.9)',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {validation.isValid
            ? '✓ Card is valid'
            : `⚠ ${Object.keys(validation.errors).length} error(s)`}
        </Typography>
      </Box>
    </Box>
  );
}

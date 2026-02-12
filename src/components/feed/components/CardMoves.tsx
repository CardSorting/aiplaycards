'use client';

import { FC, useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { CardMove } from '@components/CardDisplayWrapper/types';

interface CardMovesProps {
  moves?: CardMove[] | { move1?: CardMove; move2?: CardMove };
}

const CardMoves: FC<CardMovesProps> = ({ moves }) => {
  const theme = useTheme();

  // Normalize moves data to handle different structures
  const normalizedMoves = useMemo(() => {
    if (!moves) return [];

    // If moves is an array, use it directly
    if (Array.isArray(moves)) {
      return moves.filter(move => move && move.name);
    }

    // If moves is an object with move1/move2 structure
    if (typeof moves === 'object') {
      const moveArray: CardMove[] = [];

      // Check for move1
      if (moves.move1 && moves.move1.name) {
        moveArray.push(moves.move1);
      }

      // Check for move2
      if (moves.move2 && moves.move2.name) {
        moveArray.push(moves.move2);
      }

      return moveArray;
    }

    return [];
  }, [moves]);

  if (normalizedMoves.length === 0) return null;

  return (
    <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
      {/* Moves Header */}
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '0.85rem', sm: '0.9rem' },
          color: theme.palette.text.primary,
          mb: { xs: 1.5, sm: 2 },
        }}
      >
        Moves ({normalizedMoves.length})
      </Typography>

      {/* Moves List */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fit, minmax(200px, 1fr))',
          },
          gap: { xs: 1.5, sm: 2 },
        }}
      >
        {normalizedMoves.map((move, index) => (
          <Box
            key={index}
            sx={{
              p: { xs: 1.5, sm: 2 },
              bgcolor: theme.palette.grey[50],
              borderRadius: 1,
              border: `1px solid ${theme.palette.grey[200]}`,
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                bgcolor: theme.palette.grey[100],
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  color: theme.palette.text.primary,
                }}
              >
                {move.name}
              </Typography>
              {(move.damage || move.damageAmount) && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: theme.palette.error.main,
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    fontWeight: 600,
                  }}
                >
                  {move.damage || move.damageAmount}
                </Typography>
              )}
            </Box>
            {move.description && (
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.8rem' },
                  color: theme.palette.text.secondary,
                  lineHeight: 1.4,
                }}
              >
                {move.description}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default CardMoves;

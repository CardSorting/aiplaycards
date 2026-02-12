'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { MTGCardFrame } from './MTGCardFrame';
import '../../styles/cardFrame.css';

export function MTGCardRenderer() {
  const { state } = useMTGCard();
  const { card } = state;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 1,
      }}
    >
      <MTGCardFrame card={card} />
    </Box>
  );
}

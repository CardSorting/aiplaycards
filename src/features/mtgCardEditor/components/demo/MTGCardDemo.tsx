'use client';

import React from 'react';
import { Box } from '@mui/material';
import { MTGCardEditor } from '../editor/MTGCardEditor';

export function MTGCardDemo() {
  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      <MTGCardEditor />
    </Box>
  );
}

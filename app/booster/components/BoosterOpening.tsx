'use client';

import { FC } from 'react';
import {
  Box,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';
import { UseBoosterOpeningResult } from '../hooks/useBoosterOpening';

type BoosterOpeningProps = {
  state: UseBoosterOpeningResult;
};

const BoosterOpening: FC<BoosterOpeningProps> = ({ state }) => {
  const { drawing, loadingPhase, dynamicMessage } = state;

  const getStatusMessage = () => {
    switch (loadingPhase) {
      case 'queued':
        return 'Waiting in queue...';
      case 'generating':
        return 'Generating your card...';
      case 'ready':
        return 'Card ready!';
      default:
        return 'Starting...';
    }
  };

  if (!drawing) return null;

  return (
    <Box sx={{ mb: 4, textAlign: 'center', py: 4 }}>
      <Stack spacing={3} alignItems="center">
        {/* Loading Indicator */}
        <CircularProgress
          size={60}
          sx={{
            color: 'primary.main',
          }}
        />

        {/* Status Message */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: 'text.primary',
          }}
        >
          {getStatusMessage()}
        </Typography>

        {/* Dynamic Message */}
        {dynamicMessage && (
          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              maxWidth: 400,
            }}
          >
            {dynamicMessage}
          </Typography>
        )}

        {/* Simple Progress Bar */}
        <Box sx={{ width: '100%', maxWidth: 300 }}>
          <LinearProgress
            variant={loadingPhase === 'ready' ? 'determinate' : 'indeterminate'}
            value={loadingPhase === 'ready' ? 100 : undefined}
            sx={{
              height: 6,
              borderRadius: 3,
            }}
          />
        </Box>
      </Stack>
    </Box>
  );
};

export default BoosterOpening;

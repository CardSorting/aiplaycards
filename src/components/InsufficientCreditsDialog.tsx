'use client';

import React from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { CREDIT_PACKAGES, getTotalCredits } from '../utils/credit-packages';

interface InsufficientCreditsDialogProps {
  open: boolean;
  onClose: () => void;
  required: number;
  available: number;
  feature: string; // e.g., "booster pack", "card animation", "AI generation"
  action?: string; // e.g., "open", "animate", "generate"
}

export function InsufficientCreditsDialog({
  open,
  onClose,
  required,
  available,
  feature,
  action = 'use',
}: InsufficientCreditsDialogProps) {
  const router = useRouter();
  const needed = required - available;

  // Find the best credit package to cover the shortfall
  const suggestedPackage = CREDIT_PACKAGES.find(
    pkg => getTotalCredits(pkg) >= needed,
  );

  const handlePurchaseCredits = () => {
    onClose();
    if (suggestedPackage) {
      router.push(`/credits/${suggestedPackage.id}`);
    } else {
      router.push('/credits');
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            💳 Not Enough Credits
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Typography variant="body1">
            You need <strong>{required} credits</strong> to {action} this{' '}
            {feature}, but you only have <strong>{available} credits</strong>.
          </Typography>

          <Paper
            sx={{
              p: 2,
              bgcolor: 'rgba(255,152,0,0.1)',
              border: '1px solid rgba(255,152,0,0.3)',
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>
                <Typography variant="body2" color="text.secondary">
                  You need
                </Typography>
                <Typography variant="h6" color="warning.main">
                  {needed} more credits
                </Typography>
              </Box>
              <Chip
                label={`${required - available} needed`}
                color="warning"
                variant="outlined"
              />
            </Stack>
          </Paper>

          {suggestedPackage && (
            <Paper
              sx={{
                p: 2,
                bgcolor: 'rgba(76,175,80,0.1)',
                border: '1px solid rgba(76,175,80,0.3)',
              }}
            >
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                💡 Recommended Package
              </Typography>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="body2" fontWeight="bold">
                    {suggestedPackage.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {getTotalCredits(suggestedPackage)} credits for $
                    {suggestedPackage.priceUsd.toFixed(2)}
                  </Typography>
                </Box>
                <Chip
                  label={`+${getTotalCredits(suggestedPackage) - needed} extra`}
                  color="success"
                  size="small"
                />
              </Stack>
            </Paper>
          )}

          <Typography variant="body2" color="text.secondary">
            Credits are used for premium features like opening booster packs,
            animating cards, and AI generation. All purchases are securely
            processed by PayPal.
          </Typography>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button
          onClick={handlePurchaseCredits}
          variant="contained"
          color="primary"
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #45a049 30%, #4CAF50 90%)',
            },
          }}
        >
          Buy Credits
        </Button>
      </DialogActions>
    </Dialog>
  );
}

'use client';

import React, { useState } from 'react';
import {
  Alert,
  AppBar,
  Box,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Save as SaveIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { MTGLayout } from '../../types';
import { useMTGCardExport } from '../hooks/useMTGCardExport';

export function MTGCardToolbar() {
  const { state, resetCard, updateCard } = useMTGCard();
  const { card, validation } = state;
  const { saveToDatabase } = useMTGCardExport();
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const handleSave = async () => {
    if (!validation.isValid) return;

    setSaving(true);
    try {
      const result = await saveToDatabase(card);

      if (result.success) {
        setNotification({
          open: true,
          message: 'Card saved successfully!',
          severity: 'success',
        });
      } else {
        setNotification({
          open: true,
          message: result.error || 'Failed to save card',
          severity: 'error',
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: 'An error occurred while saving',
        severity: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset the card? All changes will be lost.',
      )
    ) {
      resetCard();
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        background:
          'linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{ flexGrow: 1, color: 'white' }}
        >
          🎴 Spell Card Creator
          {card.name && (
            <Typography
              variant="body2"
              component="span"
              sx={{ ml: 2, color: 'rgba(255,255,255,0.8)' }}
            >
              • {card.name}
            </Typography>
          )}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Layout Selector */}
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel sx={{ color: 'rgba(255,255,255,0.8)' }}>
              Layout
            </InputLabel>
            <Select
              value={card.layout}
              onChange={e =>
                updateCard({ layout: e.target.value as MTGLayout })
              }
              sx={{
                color: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.3)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255,255,255,0.5)',
                },
                '& .MuiSelect-icon': {
                  color: 'rgba(255,255,255,0.8)',
                },
                backgroundColor: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
              label="Layout"
            >
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="full_art">Full Art</MenuItem>
            </Select>
          </FormControl>

          {/* Validation Status */}
          <Chip
            label={
              validation.isValid
                ? '✓ Valid'
                : `⚠ ${Object.keys(validation.errors).length} errors`
            }
            sx={{
              backgroundColor: validation.isValid
                ? 'rgba(76, 175, 80, 0.2)'
                : 'rgba(244, 67, 54, 0.2)',
              color: validation.isValid
                ? 'rgba(76, 175, 80, 1)'
                : 'rgba(244, 67, 54, 1)',
              border: validation.isValid
                ? '1px solid rgba(76, 175, 80, 0.5)'
                : '1px solid rgba(244, 67, 54, 0.5)',
            }}
            size="small"
            variant="outlined"
          />

          {/* Main Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Reset Card">
              <IconButton
                onClick={handleReset}
                size="small"
                sx={{ color: 'rgba(255,255,255,0.9)' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Save Card">
              <span>
                <IconButton
                  onClick={handleSave}
                  size="small"
                  disabled={!validation.isValid || saving}
                  sx={{
                    color:
                      validation.isValid && !saving
                        ? 'rgba(76, 175, 80, 1)'
                        : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Download as Image">
              <span>
                <IconButton
                  onClick={handleDownload}
                  size="small"
                  disabled={!validation.isValid}
                  sx={{
                    color: validation.isValid
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="Share Card">
              <span>
                <IconButton
                  onClick={handleShare}
                  size="small"
                  disabled={!validation.isValid}
                  sx={{
                    color: validation.isValid
                      ? 'rgba(255,255,255,0.9)'
                      : 'rgba(255,255,255,0.5)',
                  }}
                >
                  <ShareIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>
      </Toolbar>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification(prev => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </AppBar>
  );
}

'use client';

import React, { useRef } from 'react';
import { Box, CircularProgress, Fade, Paper, Typography } from '@mui/material';
import YugiohCardCanvas, { YugiohCardCanvasRef } from '../YugiohCardCanvas';
import { LanguageConfig, YugiohCardData } from '../../types';

interface CardPreviewPanelBalancedProps {
  cardData: YugiohCardData;
  cardMeta: Record<string, LanguageConfig>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
}

const CardPreviewPanelBalanced: React.FC<CardPreviewPanelBalancedProps> = ({
  cardData,
  cardMeta,
  isLoading,
  onLoadingChange,
}) => {
  const cardCanvasRef = useRef<YugiohCardCanvasRef>(null);

  return (
    <Paper
      elevation={1}
      sx={{
        position: 'sticky',
        top: 24,
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 600,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          mb: 2,
          fontWeight: 700,
          textAlign: 'center',
        }}
      >
        Card Preview
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        position="relative"
        sx={{
          width: '100%',
          flex: 1,
          '& canvas': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 2,
            boxShadow: 2,
          },
        }}
      >
        <Fade in={isLoading}>
          <Box
            position="absolute"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            bgcolor="rgba(255,255,255,0.9)"
            width="100%"
            height="100%"
            zIndex={2}
            sx={{
              backdropFilter: 'blur(4px)',
              borderRadius: 2,
            }}
          >
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              Generating Card...
            </Typography>
          </Box>
        </Fade>

        <YugiohCardCanvas
          ref={cardCanvasRef}
          cardData={cardData}
          cardMeta={cardMeta}
          onLoadingChange={onLoadingChange}
        />
      </Box>

      <Box textAlign="center" mt={2}>
        <Typography variant="caption" color="text.secondary">
          {cardData.cardTitle || 'Untitled Card'}
          {cardData.cardType && ` • ${cardData.cardType}`}
          {cardData.cardSubtype !== 'Normal' && ` ${cardData.cardSubtype}`}
        </Typography>
      </Box>
    </Paper>
  );
};

export default CardPreviewPanelBalanced;

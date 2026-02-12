'use client';

import React, { useRef } from 'react';
import {
  Box,
  CardContent,
  CircularProgress,
  Fade,
  Paper,
  Typography,
} from '@mui/material';
import YugiohCardCanvas, { YugiohCardCanvasRef } from '../YugiohCardCanvas';
import { LanguageConfig, YugiohCardData } from '../../types';

interface CardPreviewPanelProps {
  cardData: YugiohCardData;
  cardMeta: Record<string, LanguageConfig>;
  isLoading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onDrawCard?: () => void;
}

const CardPreviewPanel: React.FC<CardPreviewPanelProps> = ({
  cardData,
  cardMeta,
  isLoading,
  onLoadingChange,
}) => {
  const cardCanvasRef = useRef<YugiohCardCanvasRef>(null);

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'sticky',
        top: 24,
        backgroundColor: 'rgba(25, 25, 25, 0.95)',
        backgroundImage: `
          linear-gradient(135deg, rgba(25, 25, 25, 0.9) 0%, rgba(45, 45, 45, 0.9) 100%),
          url('/assets/yugioh/Screentone.png')
        `,
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        border: '2px solid rgba(255, 215, 0, 0.3)',
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: 'gold',
            textAlign: 'center',
            mb: 2,
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
          }}
        >
          📱 Card Preview
        </Typography>

        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          position="relative"
          sx={{
            minHeight: 400,
            '& canvas': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 2,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
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
              bgcolor="rgba(0,0,0,0.8)"
              width="100%"
              height="100%"
              zIndex={2}
              sx={{
                backdropFilter: 'blur(4px)',
                borderRadius: 2,
              }}
            >
              <CircularProgress
                size={60}
                sx={{
                  color: 'gold',
                  mb: 2,
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  color: 'gold',
                  fontWeight: 'medium',
                }}
              >
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
          <Typography
            variant="caption"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontStyle: 'italic',
            }}
          >
            {cardData.cardTitle || 'Untitled Card'}
            {cardData.cardType && ` • ${cardData.cardType}`}
            {cardData.cardSubtype !== 'Normal' && ` ${cardData.cardSubtype}`}
          </Typography>
        </Box>
      </CardContent>
    </Paper>
  );
};

export default CardPreviewPanel;

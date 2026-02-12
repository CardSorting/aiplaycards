'use client';

import React, { useEffect } from 'react';
import {
  AppBar,
  Box,
  CircularProgress,
  Container,
  Grid,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useYugiohCardEditor } from '../hooks/useYugiohCardEditor';
import CardPreviewPanelBalanced from './layouts/CardPreviewPanelBalanced';
import FormPanelBalanced from './layouts/FormPanelBalanced';

const YugiohEditorNew: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    cardData,
    updateCardData,
    ui,
    cardMeta,
    ygoproData,
    isLoading,
    setIsLoading,
    loadLanguageData,
    loadDefaultData,
    loadYgoProData,
    downloadCard,
  } = useYugiohCardEditor();

  useEffect(() => {
    loadLanguageData();
  }, [loadLanguageData]);

  useEffect(() => {
    if (Object.keys(cardMeta).length > 0 && !cardData.cardTitle) {
      loadDefaultData();
    }
  }, [cardMeta, cardData.cardTitle, loadDefaultData]);

  useEffect(() => {
    if (cardData.cardLoadYgoProEnabled && cardData.cardKey && ygoproData) {
      loadYgoProData(cardData.cardKey);
    }
  }, [
    cardData.cardLoadYgoProEnabled,
    cardData.cardKey,
    ygoproData,
    loadYgoProData,
  ]);

  const handleDrawCard = () => {
    // Card drawing is handled by the canvas component
  };

  const handleReset = () => {
    loadDefaultData();
  };

  if (Object.keys(ui).length === 0 || Object.keys(cardMeta).length === 0) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          width: '100vw',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: `
            url('/assets/yugioh/Screentone.png') repeat,
            linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(25,25,25,0.8) 50%, rgba(0,0,0,0.9) 100%)
          `,
          backgroundBlendMode: 'multiply',
          backgroundSize: 'auto, cover',
          backgroundAttachment: 'fixed',
          zIndex: 1000,
        }}
      >
        <CircularProgress size={80} sx={{ color: 'gold', mb: 3 }} />
        <Typography
          variant="h4"
          sx={{ color: 'gold', mb: 1, fontWeight: 'bold' }}
        />
        <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.8)' }}>
          Loading YuGiOh Card Editor...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        background: `
          url('/assets/yugioh/Screentone.png') repeat,
          linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(25,25,25,0.8) 50%, rgba(0,0,0,0.9) 100%)
        `,
        backgroundBlendMode: 'multiply',
        backgroundSize: 'auto, cover',
        backgroundAttachment: 'fixed',
        position: 'relative',
      }}
    >
      {/* Header */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          width: '100%',
          background:
            'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(25,25,25,0.9) 100%)',
          borderBottom: '2px solid rgba(255, 215, 0, 0.3)',
          mb: 3,
          backgroundAttachment: 'local',
        }}
      >
        <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
          <Box textAlign="center">
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              component="div"
              sx={{
                color: 'gold',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                letterSpacing: '0.5px',
              }}
            />
            <Typography
              variant={isMobile ? 'subtitle2' : 'subtitle1'}
              sx={{
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 'medium',
                mt: 0.5,
              }}
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container
        maxWidth={false}
        sx={{
          pb: 4,
          px: isMobile ? 1 : 3,
          width: '100%',
          maxWidth: 'none',
        }}
      >
        <Grid
          container
          spacing={3}
          sx={{
            maxWidth: '1400px',
            margin: '0 auto',
          }}
        >
          {/* Form Panel - Following Pokemon editor's pattern */}
          <Grid item xs={12} md={6} order={isMobile ? 1 : 1}>
            <Box sx={{ maxWidth: 400, margin: '0 auto' }}>
              <FormPanelBalanced
                cardData={cardData}
                updateCardData={updateCardData}
                ui={ui}
                cardMeta={cardMeta}
                onDrawCard={handleDrawCard}
                onDownload={downloadCard}
                onReset={handleReset}
              />
            </Box>
          </Grid>

          {/* Card Preview Panel */}
          <Grid item xs={12} md={6} order={isMobile ? 2 : 2}>
            <CardPreviewPanelBalanced
              cardData={cardData}
              cardMeta={cardMeta}
              isLoading={isLoading}
              onLoadingChange={setIsLoading}
            />
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          textAlign: 'center',
          py: 3,
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          mt: 4,
          width: '100%',
          background: 'rgba(0, 0, 0, 0.3)',
        }}
      />
    </Box>
  );
};

export default YugiohEditorNew;

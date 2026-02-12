'use client';

import React, { useEffect, useRef } from 'react';
import {
  AppBar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material';
import { useYugiohCardEditor } from '../hooks/useYugiohCardEditor';
import YugiohCardCanvas, { YugiohCardCanvasRef } from './YugiohCardCanvas';
import YugiohCardForm from './YugiohCardForm';

const YugiohEditor: React.FC = () => {
  const {
    cardData,
    updateCardData,
    ui,
    cardMeta,
    ygoproData,
    isLoading,
    setIsLoading,
    canvasRef: _canvasRef,
    loadLanguageData,
    loadDefaultData,
    loadYgoProData,
    saveCard,
  } = useYugiohCardEditor();

  const cardCanvasRef = useRef<YugiohCardCanvasRef>(null);

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
    cardCanvasRef.current?.drawCard();
  };

  const handleSaveCard = async () => {
    try {
      // First ensure the card is rendered
      cardCanvasRef.current?.drawCard();

      // Give canvas time to render before capturing
      await new Promise(resolve => setTimeout(resolve, 100));

      await saveCard();

      // Show success message (you could add a toast notification here)
      alert('Card saved successfully!');
    } catch (error) {
      console.error('Failed to save card:', error);
      alert(
        `Failed to save card: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      );
    }
  };

  const currentUi = ui[cardData.uiLang] || ui.en || {};

  if (Object.keys(ui).length === 0 || Object.keys(cardMeta).length === 0) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
          <Typography variant="h6" sx={{ ml: 2 }}>
            Loading YuGiOh Card Editor...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: '#2f2f2f', mb: 3 }}>
        <Toolbar>
          <Typography
            variant="h4"
            component="div"
            sx={{ flexGrow: 1, textAlign: 'center' }}
          >
            遊戯王カード製造機
            <br />
            <Typography variant="subtitle1" component="span">
              YuGiOh Card Maker
            </Typography>
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Grid
          container
          spacing={4}
          justifyContent="center"
          alignItems="flex-start"
        >
          {/* Card Preview Panel */}
          <Grid item xs={12} md={6} lg={4}>
            <Card
              sx={{
                position: 'sticky',
                top: 24,
                bgcolor: 'rgba(85, 85, 85, 0.42)',
                color: 'white',
              }}
            >
              <CardContent>
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  position="relative"
                >
                  {isLoading && (
                    <Box
                      position="absolute"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                      bgcolor="rgba(0,0,0,0.5)"
                      width="100%"
                      height="100%"
                      zIndex={1}
                    >
                      <CircularProgress color="primary" />
                    </Box>
                  )}

                  <YugiohCardCanvas
                    ref={cardCanvasRef}
                    cardData={cardData}
                    cardMeta={cardMeta}
                    onLoadingChange={setIsLoading}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Form Panel */}
          <Grid item xs={12} md={6} lg={8}>
            <Card sx={{ bgcolor: 'rgba(85, 85, 85, 0.42)', color: 'white' }}>
              <CardContent>
                <YugiohCardForm
                  cardData={cardData}
                  updateCardData={updateCardData}
                  ui={ui}
                  cardMeta={cardMeta}
                  onDrawCard={handleDrawCard}
                  onSaveCard={handleSaveCard}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Footer */}
        <Box mt={5} textAlign="center">
          <Typography variant="body2" color="white">
            Original by{' '}
            <a
              href="https://github.com/linziyou0601/yugioh-card-maker"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: 'white', textDecoration: 'none' }}
            >
              Linziyou GitHub
            </a>
            {' | '}Migrated to React/TypeScript
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default YugiohEditor;

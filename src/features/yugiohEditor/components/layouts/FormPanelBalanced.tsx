'use client';

import React from 'react';
import { Box, Button, Grid, Paper } from '@mui/material';
import { LanguageConfig, UILanguage, YugiohCardData } from '../../types';
import BasicSettingsAccordion from '../sections/BasicSettingsAccordion';
import CardTypeAccordion from '../sections/CardTypeAccordion';
import MonsterStatsAccordion from '../sections/MonsterStatsAccordion';
import PendulumAccordion from '../sections/PendulumAccordion';
import CardTextAccordion from '../sections/CardTextAccordion';

interface FormPanelBalancedProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  cardMeta: Record<string, LanguageConfig>;
  onDrawCard: () => void;
  onDownload: () => void;
  onReset: () => void;
}

const FormPanelBalanced: React.FC<FormPanelBalancedProps> = ({
  cardData,
  updateCardData,
  ui,
  cardMeta,
  onDrawCard,
  onDownload,
  onReset,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      {/* Basic Settings */}
      <BasicSettingsAccordion
        cardData={cardData}
        updateCardData={updateCardData}
        ui={ui}
        cardMeta={cardMeta}
      />

      {/* Card Type & Effects */}
      <CardTypeAccordion
        cardData={cardData}
        updateCardData={updateCardData}
        ui={ui}
      />

      {/* Monster Stats & Properties */}
      <MonsterStatsAccordion
        cardData={cardData}
        updateCardData={updateCardData}
        ui={ui}
      />

      {/* Pendulum Settings */}
      <PendulumAccordion
        cardData={cardData}
        updateCardData={updateCardData}
        ui={ui}
      />

      {/* Card Text & Effects */}
      <CardTextAccordion
        cardData={cardData}
        updateCardData={updateCardData}
        ui={ui}
      />

      {/* Action Buttons */}
      <Box sx={{ pt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              onClick={onDrawCard}
            >
              {currentUi.generate}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={onDownload}
            >
              {currentUi.download}
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={onReset}
            >
              {currentUi.reset_to_default}
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default FormPanelBalanced;

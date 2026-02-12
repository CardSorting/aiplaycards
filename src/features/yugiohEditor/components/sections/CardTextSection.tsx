'use client';

import React from 'react';
import { Box, Button, Grid, Paper, TextField, Typography } from '@mui/material';
import { UILanguage, YugiohCardData } from '../../types';

interface CardTextSectionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  onDrawCard: () => void;
  onDownload: () => void;
  onReset: () => void;
}

const CardTextSection: React.FC<CardTextSectionProps> = ({
  cardData,
  updateCardData,
  ui,
  onDrawCard,
  onDownload,
  onReset,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Card Description & Actions
      </Typography>

      <Grid container spacing={3}>
        {/* Card Description */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            multiline
            rows={6}
            label={currentUi.card_info_text}
            value={cardData.cardInfo}
            onChange={e => updateCardData({ cardInfo: e.target.value })}
            placeholder="Enter card effect or description..."
            helperText="Describe the card's effect, flavor text, or abilities"
          />
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="info"
              onClick={onDrawCard}
              size="large"
              sx={{ minWidth: 120 }}
            >
              🎨 {currentUi.generate}
            </Button>
            <Button
              variant="contained"
              color="success"
              onClick={onDownload}
              size="large"
              sx={{ minWidth: 120 }}
            >
              💾 {currentUi.download}
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={onReset}
              size="large"
              sx={{ minWidth: 120 }}
            >
              🔄 {currentUi.reset_to_default}
            </Button>
          </Box>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block', mt: 1 }}
          >
            {currentUi.auto_gen_note}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default CardTextSection;

'use client';

import React from 'react';
import {
  Box,
  Divider,
  Grid,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { UILanguage, YugiohCardData } from '../../types';

interface PendulumSectionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const PendulumSection: React.FC<PendulumSectionProps> = ({
  cardData,
  updateCardData,
  ui,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  if (!cardData.Pendulum) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'secondary.light' }}>
      <Box display="flex" alignItems="center" mb={2}>
        <Typography variant="h6" color="primary" sx={{ mr: 2 }}>
          ⚖️ {currentUi.pendulum_area}
        </Typography>
        <Divider sx={{ flexGrow: 1 }} />
      </Box>

      <Grid container spacing={3}>
        {/* Pendulum Scales */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Pendulum Scales
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label={currentUi.pendulum_blue}
                type="number"
                inputProps={{ min: 0, max: 12 }}
                value={cardData.cardBLUE}
                onChange={e =>
                  updateCardData({
                    cardBLUE: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                size="small"
                label={currentUi.pendulum_red}
                type="number"
                inputProps={{ min: 0, max: 12 }}
                value={cardData.cardRED}
                onChange={e =>
                  updateCardData({
                    cardRED: parseInt(e.target.value) || 0,
                  })
                }
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Pendulum Effect Text */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Pendulum Effect
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            size="small"
            label={currentUi.card_info_text}
            value={cardData.cardPendulumInfo}
            onChange={e => updateCardData({ cardPendulumInfo: e.target.value })}
            placeholder="Enter pendulum effect description..."
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PendulumSection;

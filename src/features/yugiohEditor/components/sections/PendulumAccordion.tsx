'use client';

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { UILanguage, YugiohCardData } from '../../types';

interface PendulumAccordionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const PendulumAccordion: React.FC<PendulumAccordionProps> = ({
  cardData,
  updateCardData,
  ui,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  if (!cardData.Pendulum) {
    return null;
  }

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="pendulum-content"
        id="pendulum-header"
      >
        <Typography fontWeight={700}>{currentUi.pendulum_area}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Pendulum Scales */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Pendulum Scales
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
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
          </Box>

          {/* Pendulum Text */}
          <TextField
            fullWidth
            multiline
            rows={5}
            label={currentUi.card_info_text}
            value={cardData.cardPendulumInfo}
            onChange={e => updateCardData({ cardPendulumInfo: e.target.value })}
          />
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default PendulumAccordion;

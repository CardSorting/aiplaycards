'use client';

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { UILanguage, YugiohCardData } from '../../types';

interface CardTextAccordionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const CardTextAccordion: React.FC<CardTextAccordionProps> = ({
  cardData,
  updateCardData,
  ui,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="card-text-content"
        id="card-text-header"
      >
        <Typography fontWeight={700}>Card Text & Effects</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Card Description */}
          <TextField
            fullWidth
            multiline
            rows={8}
            label={currentUi.card_info_text}
            value={cardData.cardInfo}
            onChange={e => updateCardData({ cardInfo: e.target.value })}
            placeholder="Enter card description and effects..."
          />

          {/* Text Size Control - Hidden for better UX */}
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default CardTextAccordion;

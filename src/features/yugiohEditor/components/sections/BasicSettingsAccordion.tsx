'use client';

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { LanguageConfig, UILanguage, YugiohCardData } from '../../types';

interface BasicSettingsAccordionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  cardMeta: Record<string, LanguageConfig>;
}

const BasicSettingsAccordion: React.FC<BasicSettingsAccordionProps> = ({
  cardData,
  updateCardData,
  ui,
  cardMeta,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  const uiLangOptions = Object.keys(ui).map(key => ({
    value: key,
    label: ui[key]?.name || key,
  }));

  const cardLangOptions = Object.keys(cardMeta).map(key => ({
    value: key,
    label: cardMeta[key]?.name || key,
  }));

  // const cardRareOptions = [
  //   { value: '0', label: 'N' },
  //   { value: '1', label: 'R' },
  //   { value: '2', label: 'UR' },
  // ];

  return (
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="basic-settings-content"
        id="basic-settings-header"
      >
        <Typography fontWeight={700}>Basic Settings</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Language Settings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Language
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{currentUi.ui_lang}</InputLabel>
                  <Select
                    value={cardData.uiLang}
                    onChange={e => updateCardData({ uiLang: e.target.value })}
                  >
                    {uiLangOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{currentUi.card_lang}</InputLabel>
                  <Select
                    value={cardData.cardLang}
                    onChange={e => updateCardData({ cardLang: e.target.value })}
                  >
                    {cardLangOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Card Name */}
          <TextField
            fullWidth
            label={currentUi.card_name}
            value={cardData.cardTitle}
            onChange={e => updateCardData({ cardTitle: e.target.value })}
          />

          {/* Card Properties - Hidden for better UX */}

          {/* YGO Pro Database - Hidden for better UX */}

          {/* Card Image Upload */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Card Artwork
            </Typography>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="card-image-upload"
              type="file"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                const file = event.target.files?.[0];
                if (file) {
                  updateCardData({ cardImg: file });
                }
              }}
            />
            <label htmlFor="card-image-upload">
              <TextField
                fullWidth
                value={cardData.cardImg?.name || ''}
                placeholder={currentUi.upload_image}
                InputProps={{
                  readOnly: true,
                  endAdornment: (
                    <Box
                      component="span"
                      sx={{
                        cursor: 'pointer',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontSize: '0.875rem',
                      }}
                    >
                      Browse
                    </Box>
                  ),
                }}
                sx={{ cursor: 'pointer' }}
              />
            </label>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default BasicSettingsAccordion;

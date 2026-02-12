'use client';

import React from 'react';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { LanguageConfig, UILanguage, YugiohCardData } from '../../types';

interface BasicSettingsSectionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  cardMeta: Record<string, LanguageConfig>;
}

const BasicSettingsSection: React.FC<BasicSettingsSectionProps> = ({
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

  const cardRareOptions = [
    { value: '0', label: 'N' },
    { value: '1', label: 'R' },
    { value: '2', label: 'UR' },
  ];

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Basic Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Language Settings Row */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Language Settings
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
        </Grid>

        {/* Card Settings Row */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Card Properties
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cardData.holo}
                    onChange={e => updateCardData({ holo: e.target.checked })}
                    size="small"
                  />
                }
                label={currentUi.square_foil_stamp}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>{currentUi.rarity}</InputLabel>
                <Select
                  value={cardData.cardRare}
                  onChange={e => updateCardData({ cardRare: e.target.value })}
                >
                  {cardRareOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={currentUi.title_color}
                type="color"
                size="small"
                value={cardData.titleColor}
                onChange={e => updateCardData({ titleColor: e.target.value })}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Card Key Section */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Card Database
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cardData.cardLoadYgoProEnabled}
                    onChange={e =>
                      updateCardData({
                        cardLoadYgoProEnabled: e.target.checked,
                      })
                    }
                    size="small"
                  />
                }
                label={currentUi.auto_fill_card_data}
              />
            </Grid>
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label={currentUi.card_secret}
                type="number"
                size="small"
                value={cardData.cardKey}
                onChange={e => updateCardData({ cardKey: e.target.value })}
                placeholder={currentUi.plz_input_card_secret}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Card Name */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={currentUi.card_name}
            size="small"
            value={cardData.cardTitle}
            onChange={e => updateCardData({ cardTitle: e.target.value })}
          />
        </Grid>

        {/* Card Image Upload */}
        <Grid item xs={12}>
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
                size="small"
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
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BasicSettingsSection;

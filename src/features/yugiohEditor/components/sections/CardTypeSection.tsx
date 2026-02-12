'use client';

import React from 'react';
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Typography,
} from '@mui/material';
import { UILanguage, YugiohCardData } from '../../types';

interface CardTypeSectionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const CardTypeSection: React.FC<CardTypeSectionProps> = ({
  cardData,
  updateCardData,
  ui,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  const cardTypeOptions = [
    { value: 'Monster', label: currentUi.monster_card },
    { value: 'Spell', label: currentUi.spell_card },
    { value: 'Trap', label: currentUi.trap_card },
  ];

  const getCardSubtypeOptions = () => {
    switch (cardData.cardType) {
      case 'Monster':
        return [
          { value: 'Normal', label: currentUi.m_card.normal },
          { value: 'Effect', label: currentUi.m_card.effect },
          { value: 'Fusion', label: currentUi.m_card.fusion },
          { value: 'Ritual', label: currentUi.m_card.ritual },
          { value: 'Synchro', label: currentUi.m_card.synchro },
          { value: 'Xyz', label: currentUi.m_card.xyz },
          { value: 'Link', label: currentUi.m_card.link },
          { value: 'Token', label: currentUi.m_card.token },
          { value: 'Slifer', label: currentUi.m_card.slifer },
          { value: 'Ra', label: currentUi.m_card.ra },
          { value: 'Obelisk', label: currentUi.m_card.obelisk },
          { value: 'LDragon', label: currentUi.m_card.ldragon },
        ];
      case 'Spell':
        return [
          { value: 'Normal', label: currentUi.st_card.normal },
          { value: 'Continuous', label: currentUi.st_card.continuous },
          { value: 'Field', label: currentUi.st_card.field },
          { value: 'Equip', label: currentUi.st_card.equip },
          { value: 'Quick', label: currentUi.st_card.quick },
          { value: 'Ritual', label: currentUi.st_card.ritual },
        ];
      case 'Trap':
        return [
          { value: 'Normal', label: currentUi.st_card.normal },
          { value: 'Continuous', label: currentUi.st_card.continuous },
          { value: 'Counter', label: currentUi.st_card.counter },
        ];
      default:
        return [];
    }
  };

  const cardEffectOptions = [
    { value: 'none', label: currentUi.card_effect_opts?.none || 'None' },
    { value: 'normal', label: currentUi.card_effect_opts?.normal || 'Normal' },
    { value: 'toon', label: currentUi.card_effect_opts?.toon || 'Toon' },
    { value: 'spirit', label: currentUi.card_effect_opts?.spirit || 'Spirit' },
    { value: 'union', label: currentUi.card_effect_opts?.union || 'Union' },
    { value: 'gemini', label: currentUi.card_effect_opts?.gemini || 'Gemini' },
    { value: 'flip', label: currentUi.card_effect_opts?.flip || 'Flip' },
    { value: 'tuner', label: currentUi.card_effect_opts?.tuner || 'Tuner' },
  ];

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Card Type & Effects
      </Typography>

      <Grid container spacing={3}>
        {/* Main Card Type */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Card Classification
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{currentUi.card_type}</InputLabel>
                <Select
                  value={cardData.cardType}
                  onChange={e =>
                    updateCardData({
                      cardType: e.target.value as 'Monster' | 'Spell' | 'Trap',
                      cardSubtype: 'Normal',
                    })
                  }
                >
                  {cardTypeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{currentUi.card_subtype}</InputLabel>
                <Select
                  value={cardData.cardSubtype}
                  onChange={e =>
                    updateCardData({ cardSubtype: e.target.value })
                  }
                >
                  {getCardSubtypeOptions().map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Grid>

        {/* Monster Effects */}
        {cardData.cardType === 'Monster' && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Monster Effects
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>{currentUi.card_effect}</InputLabel>
                  <Select
                    value={cardData.cardEff1}
                    onChange={e => updateCardData({ cardEff1: e.target.value })}
                  >
                    {cardEffectOptions
                      .filter(
                        opt =>
                          opt.value !== 'none' &&
                          (opt.value === 'normal' ||
                            opt.value !== cardData.cardEff2),
                      )
                      .map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Secondary Effect</InputLabel>
                  <Select
                    value={cardData.cardEff2}
                    onChange={e => updateCardData({ cardEff2: e.target.value })}
                  >
                    {cardEffectOptions
                      .filter(
                        opt =>
                          opt.value === 'normal' ||
                          opt.value !== cardData.cardEff1,
                      )
                      .map(option => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.value === 'normal'
                            ? currentUi.m_card.effect
                            : option.label}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default CardTypeSection;

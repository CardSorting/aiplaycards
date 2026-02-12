'use client';

import React from 'react';
import {
  FormControl,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { MTG_LAYOUTS, MTG_RARITIES } from '../../types/constants';
import MTGCardNameSearch from './MTGCardNameSearch';
import { mapScryfallDataToMTGCard } from '../../utils/scryfallDataMapper';
import { ScryfallCardData } from '../../services/scryfallService';

export function BasicInfoForm() {
  const { state, updateCard } = useMTGCard();
  const { card, validation } = state;

  const handleCardSelect = (scryfallData: ScryfallCardData) => {
    const mappedData = mapScryfallDataToMTGCard(scryfallData);
    updateCard(mappedData);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Card Name"
          value={card.name}
          onChange={e => updateCard({ name: e.target.value })}
          error={!!validation.errors.name}
          helperText={validation.errors.name}
          required
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Rarity</InputLabel>
          <Select
            value={card.rarity}
            onChange={e => updateCard({ rarity: e.target.value as any })}
            label="Rarity"
          >
            {Object.entries(MTG_RARITIES).map(([key, rarity]) => (
              <MenuItem key={key} value={key}>
                {rarity.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Layout</InputLabel>
          <Select
            value={card.layout}
            onChange={e => updateCard({ layout: e.target.value as any })}
            label="Layout"
          >
            {Object.entries(MTG_LAYOUTS).map(([key, layout]) => (
              <MenuItem key={key} value={key}>
                {layout.name}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {MTG_LAYOUTS[card.layout]?.description}
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Set Code"
          value={card.set}
          onChange={e => updateCard({ set: e.target.value })}
          placeholder="e.g., NEO, MID, VOW"
          helperText="Three-letter set code"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Artist"
          value={card.artist || ''}
          onChange={e => updateCard({ artist: e.target.value })}
          placeholder="Artist name"
        />
      </Grid>

      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Flavor Text"
          value={card.flavorText || ''}
          onChange={e => updateCard({ flavorText: e.target.value })}
          multiline
          rows={2}
          placeholder="Flavor text appears in italics below the rules text"
        />
      </Grid>

      {/* MTG Card Search */}
      <Grid item xs={12}>
        <div
          style={{
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
          }}
        >
          <MTGCardNameSearch onCardSelect={handleCardSelect} disabled={false} />
        </div>
      </Grid>
    </Grid>
  );
}

'use client';

import React from 'react';
import {
  Box,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { estimateCardComplexity } from '../../utils/cardUtils';

export function TextForm() {
  const { state, updateCard } = useMTGCard();
  const { card } = state;

  const complexity = estimateCardComplexity(card);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Rules Text"
          value={card.text || ''}
          onChange={e => updateCard({ text: e.target.value })}
          multiline
          rows={6}
          placeholder="Enter the card's rules text here..."
          helperText="Use double line breaks to separate abilities"
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Text Formatting Guide
        </Typography>
        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Mana Symbols:</strong> Use curly braces, e.g., {'{T}'},{' '}
            {'{W}'}, {'{2}'}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Abilities:</strong> Separate each ability with a double line
            break
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Keywords:</strong> flying, trample, hexproof, etc.
          </Typography>
          <Typography variant="body2">
            <strong>Activated Abilities:</strong> Cost: Effect (e.g., {'{T}'}:
            Draw a card)
          </Typography>
        </Box>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          <strong>Estimated Complexity:</strong> {complexity}/10
          {complexity > 7 && ' (High complexity - consider simplifying)'}
          {complexity < 3 &&
            ' (Low complexity - might need more interesting mechanics)'}
        </Typography>
      </Grid>

      <Grid item xs={12}>
        <FormHelperText>
          <strong>Common MTG Keywords:</strong>
          <br />
          flying, trample, vigilance, lifelink, deathtouch, first strike, double
          strike, haste, reach, hexproof, indestructible, menace, prowess,
          flash, defender, scry, surveil, explore, adapt, mentor, convoke,
          delve, affinity
        </FormHelperText>
      </Grid>
    </Grid>
  );
}

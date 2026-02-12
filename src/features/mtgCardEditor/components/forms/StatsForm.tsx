'use client';

import React from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import { isCreature, isPlaneswalker } from '../../utils/cardUtils';

export function StatsForm() {
  const { state, updateCard } = useMTGCard();
  const { card, validation } = state;

  const showCreatureStats = isCreature(card);
  const showPlaneswalkerStats = isPlaneswalker(card);

  if (!showCreatureStats && !showPlaneswalkerStats) {
    return (
      <Box sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="body2" color="text.secondary">
          Stats are only available for creatures and planeswalkers.
          <br />
          Select &quot;Creature&quot; or &quot;Planeswalker&quot; in Card Type
          to see stat options.
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {showCreatureStats && (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Creature Stats
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Power"
              value={card.power || ''}
              onChange={e => updateCard({ power: e.target.value })}
              error={!!validation.errors.power}
              helperText={validation.errors.power || 'e.g., 3, *, X, 1+1'}
              placeholder="0"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              label="Toughness"
              value={card.toughness || ''}
              onChange={e => updateCard({ toughness: e.target.value })}
              error={!!validation.errors.toughness}
              helperText={validation.errors.toughness || 'e.g., 3, *, X, 1+1'}
              placeholder="0"
            />
          </Grid>
        </>
      )}

      {showPlaneswalkerStats && (
        <>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Planeswalker Stats
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Starting Loyalty"
              value={card.loyalty || ''}
              onChange={e => updateCard({ loyalty: e.target.value })}
              error={!!validation.errors.loyalty}
              helperText={
                validation.errors.loyalty || 'Starting loyalty counters'
              }
              placeholder="3"
              type="number"
            />
          </Grid>
        </>
      )}

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          <strong>Tips:</strong>
          <br />
          • Use numbers for normal stats (e.g., 3, 5)
          <br />
          • Use * for variable stats that depend on game state
          <br />
          • Use X for stats that depend on X in the mana cost
          <br />• Use +/- for modification (e.g., 1+1, 2-1)
        </Typography>
      </Grid>
    </Grid>
  );
}

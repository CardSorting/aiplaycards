'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  FormHelperText,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import {
  calculateConvertedManaCost,
  parseManaCost,
} from '../../utils/manaUtils';
import { MTG_COLORS } from '../../types/constants';

export function ManaCostForm() {
  const { state, updateCard } = useMTGCard();
  const { card, validation } = state;
  const [manaCostInput, setManaCostInput] = useState(card.manaCost || '');

  const handleManaCostChange = (value: string) => {
    setManaCostInput(value);
    updateCard({ manaCost: value });

    if (value) {
      const parsedCost = parseManaCost(value);
      const cmc = calculateConvertedManaCost(parsedCost);
      updateCard({ convertedManaCost: cmc });
    } else {
      updateCard({ convertedManaCost: undefined });
    }
  };

  const addManaSymbol = (symbol: string) => {
    const newCost = manaCostInput + symbol;
    handleManaCostChange(newCost);
  };

  const clearManaCost = () => {
    handleManaCostChange('');
  };

  const parsedCost = card.manaCost ? parseManaCost(card.manaCost) : null;
  const cmc = parsedCost ? calculateConvertedManaCost(parsedCost) : 0;

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Mana Cost"
          value={manaCostInput}
          onChange={e => handleManaCostChange(e.target.value)}
          placeholder="e.g., {3}{U}{R} or {X}{W}{W}"
          error={!!validation.warnings.manaCost}
          helperText={
            validation.warnings.manaCost ||
            'Use curly braces around mana symbols'
          }
        />
      </Grid>

      <Grid item xs={12}>
        <Typography variant="subtitle2" gutterBottom>
          Quick Add Mana Symbols:
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          {/* Generic mana */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20].map(cost => (
            <Button
              key={cost}
              variant="outlined"
              size="small"
              onClick={() => addManaSymbol(`{${cost}}`)}
            >
              {cost}
            </Button>
          ))}

          {/* X mana */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => addManaSymbol('{X}')}
          >
            X
          </Button>

          {/* Colored mana */}
          {Object.entries(MTG_COLORS).map(([colorCode, color]) => (
            <Button
              key={colorCode}
              variant="outlined"
              size="small"
              onClick={() => addManaSymbol(`{${colorCode}}`)}
              sx={{ color: color.hex, borderColor: color.hex }}
            >
              {colorCode}
            </Button>
          ))}

          {/* Colorless mana */}
          <Button
            variant="outlined"
            size="small"
            onClick={() => addManaSymbol('{C}')}
          >
            C
          </Button>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="text"
            size="small"
            onClick={clearManaCost}
            color="secondary"
          >
            Clear
          </Button>
        </Box>
      </Grid>

      {card.manaCost && (
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Converted Mana Cost: {cmc}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Preview: {card.manaCost}
          </Typography>
        </Grid>
      )}

      <Grid item xs={12}>
        <FormHelperText>
          Common patterns: {'{2}{W}'} for two generic + white, {'{W/U}'} for
          hybrid white/blue, {'{W/P}'} for Phyrexian white
        </FormHelperText>
      </Grid>
    </Grid>
  );
}

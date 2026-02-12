'use client';

import React from 'react';
import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import {
  MTG_ARTIFACT_SUBTYPES,
  MTG_CARD_TYPES,
  MTG_CREATURE_SUBTYPES,
  MTG_ENCHANTMENT_SUBTYPES,
  MTG_LAND_SUBTYPES,
  MTG_PLANESWALKER_SUBTYPES,
  MTG_POPULAR_TOKEN_SUBTYPES,
  MTG_SPELL_SUBTYPES,
  MTG_SUPERTYPES,
  MTG_TOKEN_TYPES,
} from '../../types/constants';
import { formatCardType, parseCardType } from '../../utils/cardUtils';

export function CardTypeForm() {
  const { state, updateCard } = useMTGCard();
  const { card, validation } = state;

  const cardType = parseCardType(card.type);

  const handleSupertypeChange = (supertype: string) => {
    const newType = formatCardType({
      ...cardType,
      supertype: supertype || undefined,
    });
    updateCard({ type: newType });
  };

  const handleTypeChange = (types: string[]) => {
    const newType = formatCardType({
      ...cardType,
      types,
    });
    updateCard({ type: newType });
  };

  const handleTokenChange = (isToken: boolean) => {
    updateCard({ isToken });
  };

  const handleSubtypeChange = (subtypes: string[]) => {
    const newType = formatCardType({
      ...cardType,
      subtypes: subtypes.length > 0 ? subtypes : undefined,
    });
    updateCard({ type: newType });
  };

  const getAvailableSubtypes = () => {
    const types = cardType.types;
    let availableSubtypes: string[] = [];

    // If it's a token, use popular token subtypes
    if (card.isToken) {
      availableSubtypes = [...availableSubtypes, ...MTG_POPULAR_TOKEN_SUBTYPES];
    } else {
      // Regular card subtypes
      if (types.includes('Creature')) {
        availableSubtypes = [...availableSubtypes, ...MTG_CREATURE_SUBTYPES];
      }
      if (types.includes('Artifact')) {
        availableSubtypes = [...availableSubtypes, ...MTG_ARTIFACT_SUBTYPES];
      }
      if (types.includes('Enchantment')) {
        availableSubtypes = [...availableSubtypes, ...MTG_ENCHANTMENT_SUBTYPES];
      }
      if (types.includes('Land')) {
        availableSubtypes = [...availableSubtypes, ...MTG_LAND_SUBTYPES];
      }
      if (types.includes('Planeswalker')) {
        availableSubtypes = [
          ...availableSubtypes,
          ...MTG_PLANESWALKER_SUBTYPES,
        ];
      }
      if (types.includes('Instant') || types.includes('Sorcery')) {
        availableSubtypes = [...availableSubtypes, ...MTG_SPELL_SUBTYPES];
      }
    }

    return [...new Set(availableSubtypes)].sort();
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Checkbox
              checked={card.isToken || false}
              onChange={e => handleTokenChange(e.target.checked)}
            />
          }
          label="Token"
        />
        <FormHelperText>Check if this is a token card</FormHelperText>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth>
          <InputLabel>Supertype</InputLabel>
          <Select
            value={cardType.supertype || ''}
            onChange={e => handleSupertypeChange(e.target.value)}
            label="Supertype"
          >
            <MenuItem value="">None</MenuItem>
            {MTG_SUPERTYPES.map((supertype, index) => (
              <MenuItem key={`${supertype}-${index}`} value={supertype}>
                {supertype}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            Optional (Legendary, Basic, Snow, etc.)
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!validation.errors.type}>
          <InputLabel>Card Types</InputLabel>
          <Select
            multiple
            value={cardType.types}
            onChange={e => handleTypeChange(e.target.value as string[])}
            label="Card Types"
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {(card.isToken ? MTG_TOKEN_TYPES : MTG_CARD_TYPES).map(
              (type, index) => (
                <MenuItem key={`${type}-${index}`} value={type}>
                  {type}
                </MenuItem>
              ),
            )}
          </Select>
          <FormHelperText>
            {validation.errors.type || 'Required (Creature, Instant, etc.)'}
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Subtypes</InputLabel>
          <Select
            multiple
            value={cardType.subtypes || []}
            onChange={e => handleSubtypeChange(e.target.value as string[])}
            label="Subtypes"
            disabled={getAvailableSubtypes().length === 0}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} size="small" />
                ))}
              </Box>
            )}
          >
            {getAvailableSubtypes().map((subtype, index) => (
              <MenuItem key={`${subtype}-${index}`} value={subtype}>
                {subtype}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText>
            {getAvailableSubtypes().length === 0
              ? 'Select card types first to see available subtypes'
              : 'Optional (Human, Soldier, Equipment, etc.)'}
          </FormHelperText>
        </FormControl>
      </Grid>

      <Grid item xs={12}>
        <Typography variant="body2" color="text.secondary">
          <strong>Full Type:</strong> {card.type || 'No type set'}
        </Typography>
      </Grid>
    </Grid>
  );
}

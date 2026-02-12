'use client';

import React from 'react';
import { Box, Chip, Divider, Paper, Typography } from '@mui/material';
import { useMTGCard } from '../../contexts/MTGCardContext';
import {
  estimateCardComplexity,
  getCardColors,
  parseCardType,
} from '../../utils/cardUtils';
import {
  calculateConvertedManaCost,
  parseManaCost,
} from '../../utils/manaUtils';
import { MTG_COLORS, MTG_RARITIES } from '../../types/constants';

export function MTGCardTextPreview() {
  const { state } = useMTGCard();
  const { card } = state;

  const cardType = parseCardType(card.type);
  const cardColors = getCardColors(card);
  const complexity = estimateCardComplexity(card);
  const manaCost = card.manaCost ? parseManaCost(card.manaCost) : null;
  const cmc = manaCost ? calculateConvertedManaCost(manaCost) : 0;

  const renderField = (label: string, value: any, color?: string) => {
    if (!value) return null;
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {label}:
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: color || 'text.primary',
            fontWeight: color ? 'bold' : 'normal',
          }}
        >
          {value}
        </Typography>
      </Box>
    );
  };

  const renderStats = () => {
    if (!card.power && !card.toughness && !card.loyalty) return null;

    let stats = '';
    if (card.power && card.toughness) {
      stats = `${card.power}/${card.toughness}`;
    } else if (card.loyalty) {
      stats = card.loyalty;
    }

    return renderField(
      cardType.types.includes('Planeswalker')
        ? 'Starting Loyalty'
        : 'Power/Toughness',
      stats,
    );
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom color="primary">
          {card.name || 'Untitled Card'}
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Basic Info */}
        <Box sx={{ mb: 3 }}>
          {renderField('Mana Cost', card.manaCost)}
          {card.manaCost && (
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle2"
                color="text.secondary"
                gutterBottom
              >
                Converted Mana Cost:
              </Typography>
              <Typography variant="body1">{cmc}</Typography>
            </Box>
          )}

          {renderField('Type', card.type)}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Rarity:
            </Typography>
            <Chip
              label={MTG_RARITIES[card.rarity]?.name || 'Unknown'}
              size="small"
              sx={{
                backgroundColor: MTG_RARITIES[card.rarity]?.color || '#ccc',
                color: card.rarity === 'common' ? '#fff' : '#000',
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Colors */}
        {cardColors.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Colors:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {cardColors.map(color => (
                <Chip
                  key={color}
                  label={MTG_COLORS[color].name}
                  size="small"
                  sx={{
                    backgroundColor: MTG_COLORS[color].hex,
                    color: color === 'B' ? '#fff' : '#000',
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Stats */}
        {renderStats()}

        {/* Rules Text */}
        {renderField('Rules Text', card.text)}

        {/* Flavor Text */}
        {card.flavorText && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Flavor Text:
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontStyle: 'italic', color: 'text.secondary' }}
            >
              {card.flavorText}
            </Typography>
          </Box>
        )}

        <Divider sx={{ mb: 3 }} />

        {/* Additional Info */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Set:
          </Typography>
          <Typography variant="body1">
            {card.set || 'No set specified'}
          </Typography>
        </Box>

        {renderField('Artist', card.artist)}

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Layout:
          </Typography>
          <Typography variant="body1">{card.layout || 'normal'}</Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Complexity Score:
          </Typography>
          <Typography variant="body1">
            {complexity}/10
            {complexity > 7 && (
              <Typography component="span" color="warning.main" sx={{ ml: 1 }}>
                (High)
              </Typography>
            )}
            {complexity < 3 && (
              <Typography component="span" color="info.main" sx={{ ml: 1 }}>
                (Simple)
              </Typography>
            )}
          </Typography>
        </Box>

        {/* Type Breakdown */}
        {card.type && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Type Breakdown:
            </Typography>
            <Box sx={{ pl: 2 }}>
              {cardType.supertype && (
                <Typography variant="body2">
                  <strong>Supertype:</strong> {cardType.supertype}
                </Typography>
              )}
              <Typography variant="body2">
                <strong>Types:</strong> {cardType.types.join(', ') || 'None'}
              </Typography>
              {cardType.subtypes && cardType.subtypes.length > 0 && (
                <Typography variant="body2">
                  <strong>Subtypes:</strong> {cardType.subtypes.join(', ')}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

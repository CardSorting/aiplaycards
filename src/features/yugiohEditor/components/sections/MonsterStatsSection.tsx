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
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { UILanguage, YugiohCardData } from '../../types';

interface MonsterStatsSectionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const MonsterStatsSection: React.FC<MonsterStatsSectionProps> = ({
  cardData,
  updateCardData,
  ui,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;

  if (cardData.cardType !== 'Monster') {
    return null;
  }

  const cardAttributeOptions = [
    { value: 'DIVINE', label: currentUi.card_attr_opts?.divine || 'Divine' },
    { value: 'EARTH', label: currentUi.card_attr_opts?.earth || 'Earth' },
    { value: 'WATER', label: currentUi.card_attr_opts?.water || 'Water' },
    { value: 'FIRE', label: currentUi.card_attr_opts?.fire || 'Fire' },
    { value: 'WIND', label: currentUi.card_attr_opts?.wind || 'Wind' },
    { value: 'LIGHT', label: currentUi.card_attr_opts?.light || 'Light' },
    { value: 'DARK', label: currentUi.card_attr_opts?.dark || 'Dark' },
  ];

  const cardRaceOptions = Object.entries(
    currentUi.card_race_type_opts || {},
  ).map(([key, value]) => ({
    value: key,
    label: value,
  }));

  const levelOptions = Array.from({ length: 13 }, (_, i) => ({
    value: i.toString(),
    label: i.toString(),
  }));

  const isLinkMonster = cardData.cardSubtype === 'Link';
  const canPendulumEnabled = !['Slifer', 'Ra', 'Obelisk', 'LDragon'].includes(
    cardData.cardSubtype,
  );

  const handleLinkChange = (linkIndex: number) => {
    const newLinks = {
      ...cardData.links,
      [linkIndex]: {
        ...cardData.links[linkIndex],
        val: !cardData.links[linkIndex].val,
      },
    };
    updateCardData({ links: newLinks });
  };

  const LinkGrid = () => (
    <Table size="small">
      <TableBody>
        {[0, 1, 2].map(row => (
          <TableRow key={row}>
            {[1, 2, 3].map(col => {
              const linkIndex = row * 3 + col;
              if (linkIndex === 5) return <TableCell key={col} />;

              return (
                <TableCell
                  key={col}
                  align="center"
                  sx={{ border: 'none', p: 0.5 }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cardData.links[linkIndex]?.val || false}
                        onChange={() => handleLinkChange(linkIndex)}
                        size="small"
                      />
                    }
                    label={cardData.links[linkIndex]?.symbol}
                    sx={{ m: 0 }}
                  />
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom color="primary">
        Monster Properties
      </Typography>

      <Grid container spacing={3}>
        {/* Attribute and Race */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Attribute & Race
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>{currentUi.card_attribute}</InputLabel>
                <Select
                  value={cardData.cardAttr}
                  onChange={e =>
                    updateCardData({ cardAttr: e.target.value as any })
                  }
                >
                  {cardAttributeOptions.map(option => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={cardData.cardCustomRaceEnabled}
                    onChange={e =>
                      updateCardData({
                        cardCustomRaceEnabled: e.target.checked,
                      })
                    }
                    size="small"
                  />
                }
                label={currentUi.custom}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              {cardData.cardCustomRaceEnabled ? (
                <TextField
                  fullWidth
                  size="small"
                  label={currentUi.plz_input_race_type}
                  value={cardData.cardCustomRace}
                  onChange={e =>
                    updateCardData({ cardCustomRace: e.target.value })
                  }
                />
              ) : (
                <FormControl fullWidth size="small">
                  <InputLabel>Race</InputLabel>
                  <Select
                    value={cardData.cardRace}
                    onChange={e => updateCardData({ cardRace: e.target.value })}
                  >
                    {cardRaceOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Grid>
          </Grid>
        </Grid>

        {/* Special Properties */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Special Properties
          </Typography>
          <Grid container spacing={2}>
            {canPendulumEnabled && (
              <Grid item xs={12} sm={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cardData.Pendulum}
                      onChange={e =>
                        updateCardData({ Pendulum: e.target.checked })
                      }
                      size="small"
                    />
                  }
                  label={currentUi.pendulum}
                />
              </Grid>
            )}
            {!isLinkMonster && (
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>{currentUi.lavel_and_rank}</InputLabel>
                  <Select
                    value={cardData.cardLevel}
                    onChange={e =>
                      updateCardData({ cardLevel: e.target.value })
                    }
                  >
                    {levelOptions.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </Grid>

        {/* ATK/DEF/Link */}
        <Grid item xs={12}>
          <Typography variant="subtitle2" gutterBottom>
            Combat Stats
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label={currentUi.attack}
                value={cardData.cardATK}
                onChange={e => updateCardData({ cardATK: e.target.value })}
              />
            </Grid>
            {!isLinkMonster && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  size="small"
                  label={currentUi.defence}
                  value={cardData.cardDEF}
                  onChange={e => updateCardData({ cardDEF: e.target.value })}
                />
              </Grid>
            )}
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                size="small"
                label={currentUi.text_size}
                type="number"
                value={cardData.infoSize}
                onChange={e => updateCardData({ infoSize: e.target.value })}
              />
            </Grid>
          </Grid>
        </Grid>

        {/* Link Monster Grid */}
        {isLinkMonster && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              {currentUi.link}
            </Typography>
            <Box sx={{ display: 'inline-block' }}>
              <LinkGrid />
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};

export default MonsterStatsSection;

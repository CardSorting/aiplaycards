'use client';

import React from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { UILanguage, YugiohCardData } from '../../types';

interface MonsterStatsAccordionProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
}

const MonsterStatsAccordion: React.FC<MonsterStatsAccordionProps> = ({
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
                <TableCell key={col} align="center">
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cardData.links[linkIndex]?.val || false}
                        onChange={() => handleLinkChange(linkIndex)}
                      />
                    }
                    label={cardData.links[linkIndex]?.symbol}
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
    <Accordion defaultExpanded disableGutters>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="monster-stats-content"
        id="monster-stats-header"
      >
        <Typography fontWeight={700}>Monster Stats & Properties</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Attribute and Race */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Attribute & Race
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
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
              <Grid item xs={6}>
                <FormControl fullWidth>
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
              </Grid>
            </Grid>
          </Box>

          {/* Special Properties */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Special Properties
            </Typography>
            <Grid container spacing={2} alignItems="center">
              {canPendulumEnabled && (
                <Grid item xs={4}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={cardData.Pendulum}
                        onChange={e =>
                          updateCardData({ Pendulum: e.target.checked })
                        }
                      />
                    }
                    label={currentUi.pendulum}
                  />
                </Grid>
              )}
              {!isLinkMonster && (
                <Grid item xs={4}>
                  <FormControl fullWidth>
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
          </Box>

          {/* ATK/DEF/Link */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Combat Stats
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label={currentUi.attack}
                  value={cardData.cardATK}
                  onChange={e => updateCardData({ cardATK: e.target.value })}
                />
              </Grid>
              {!isLinkMonster && (
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label={currentUi.defence}
                    value={cardData.cardDEF}
                    onChange={e => updateCardData({ cardDEF: e.target.value })}
                  />
                </Grid>
              )}
              {isLinkMonster && (
                <Grid item xs={8}>
                  <Typography variant="subtitle2" gutterBottom>
                    {currentUi.link}
                  </Typography>
                  <LinkGrid />
                </Grid>
              )}
            </Grid>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default MonsterStatsAccordion;

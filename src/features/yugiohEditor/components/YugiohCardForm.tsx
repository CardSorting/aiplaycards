'use client';

import React from 'react';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
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
import { LanguageConfig, UILanguage, YugiohCardData } from '../types';
import CardNameSearch from './CardNameSearch';
import { mapYgoProDataToCardData } from '../utils/ygoProDataMapper';
import { YgoProCardData } from '../services/ygoProService';

interface YugiohCardFormProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  cardMeta: Record<string, LanguageConfig>;
  onDrawCard: () => void;
  onSaveCard: () => Promise<void>;
}

const YugiohCardForm: React.FC<YugiohCardFormProps> = ({
  cardData,
  updateCardData,
  ui,
  cardMeta,
  onDrawCard,
  onSaveCard,
}) => {
  const currentUi = ui[cardData.uiLang] || ui.en;
  const currentMeta = cardMeta[cardData.cardLang] || cardMeta.en;

  if (!currentUi || !currentMeta) {
    return <Typography>Loading language data...</Typography>;
  }

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

  const cardAttributeOptions = [
    { value: 'DIVINE', label: currentUi.card_attr_opts?.divine || 'Divine' },
    { value: 'EARTH', label: currentUi.card_attr_opts?.earth || 'Earth' },
    { value: 'WATER', label: currentUi.card_attr_opts?.water || 'Water' },
    { value: 'FIRE', label: currentUi.card_attr_opts?.fire || 'Fire' },
    { value: 'WIND', label: currentUi.card_attr_opts?.wind || 'Wind' },
    { value: 'LIGHT', label: currentUi.card_attr_opts?.light || 'Light' },
    { value: 'DARK', label: currentUi.card_attr_opts?.dark || 'Dark' },
  ];

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

  // const isEffectMonster =
  //   cardData.cardSubtype === 'Effect' ||
  //   (cardData.cardEff2 !== 'none' && cardData.cardSubtype !== 'Normal');
  // const isXyzMonster =
  //   cardData.cardType === 'Monster' && cardData.cardSubtype === 'Xyz';
  const isLinkMonster =
    cardData.cardType === 'Monster' && cardData.cardSubtype === 'Link';
  const canPendulumEnabled =
    cardData.cardType === 'Monster' &&
    !['Slifer', 'Ra', 'Obelisk', 'LDragon'].includes(cardData.cardSubtype);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      updateCardData({ cardImg: file });
    }
  };

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

  const handleCardSelect = (ygoProData: YgoProCardData) => {
    const mappedData = mapYgoProDataToCardData(ygoProData, cardData);
    updateCardData(mappedData);
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
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {currentUi.card_name || 'Card Editor'}
        </Typography>

        <Grid container spacing={3}>
          {/* Language Settings */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
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
                <FormControl fullWidth>
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
            <Grid container spacing={2}>
              <Grid item xs={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cardData.holo}
                      onChange={e => updateCardData({ holo: e.target.checked })}
                    />
                  }
                  label={currentUi.square_foil_stamp}
                />
              </Grid>
              <Grid item xs={3}>
                <FormControl fullWidth>
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
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label={currentUi.title_color}
                  type="color"
                  value={cardData.titleColor}
                  onChange={e => updateCardData({ titleColor: e.target.value })}
                />
              </Grid>
            </Grid>
          </Grid>

          {/* Card Key */}
          <Grid item xs={12}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={4}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={cardData.cardLoadYgoProEnabled}
                      onChange={e =>
                        updateCardData({
                          cardLoadYgoProEnabled: e.target.checked,
                        })
                      }
                    />
                  }
                  label={currentUi.auto_fill_card_data}
                />
              </Grid>
              <Grid item xs={8}>
                <TextField
                  fullWidth
                  label={currentUi.card_secret}
                  type="number"
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
              value={cardData.cardTitle}
              onChange={e => updateCardData({ cardTitle: e.target.value })}
            />
          </Grid>

          {/* Card Name Search */}
          <Grid item xs={12}>
            <Card sx={{ p: 2, bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
              <CardNameSearch
                onCardSelect={handleCardSelect}
                disabled={false}
              />
            </Card>
          </Grid>

          {/* Card Image Upload */}
          <Grid item xs={12}>
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="card-image-upload"
              type="file"
              onChange={handleFileUpload}
            />
            <label htmlFor="card-image-upload">
              <Button variant="outlined" component="span" fullWidth>
                {currentUi.upload_image}
              </Button>
            </label>
          </Grid>

          {/* Card Type Settings */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <FormControl fullWidth>
                  <InputLabel>{currentUi.card_type}</InputLabel>
                  <Select
                    value={cardData.cardType}
                    onChange={e =>
                      updateCardData({
                        cardType: e.target.value as
                          | 'Monster'
                          | 'Spell'
                          | 'Trap',
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
              <Grid item xs={4}>
                <FormControl fullWidth>
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
              {cardData.cardType === 'Monster' && (
                <>
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <InputLabel>{currentUi.card_effect}</InputLabel>
                      <Select
                        value={cardData.cardEff1}
                        onChange={e =>
                          updateCardData({ cardEff1: e.target.value })
                        }
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
                  <Grid item xs={2}>
                    <FormControl fullWidth>
                      <Select
                        value={cardData.cardEff2}
                        onChange={e =>
                          updateCardData({ cardEff2: e.target.value })
                        }
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
                </>
              )}
            </Grid>
          </Grid>

          {/* Monster-specific fields */}
          {cardData.cardType === 'Monster' && (
            <>
              {/* Attribute and Race */}
              <Grid item xs={12}>
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
                  <Grid item xs={3}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={cardData.cardCustomRaceEnabled}
                          onChange={e =>
                            updateCardData({
                              cardCustomRaceEnabled: e.target.checked,
                            })
                          }
                        />
                      }
                      label={currentUi.custom}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    {cardData.cardCustomRaceEnabled ? (
                      <TextField
                        fullWidth
                        label={currentUi.plz_input_race_type}
                        value={cardData.cardCustomRace}
                        onChange={e =>
                          updateCardData({ cardCustomRace: e.target.value })
                        }
                      />
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel>Race</InputLabel>
                        <Select
                          value={cardData.cardRace}
                          onChange={e =>
                            updateCardData({ cardRace: e.target.value })
                          }
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

              {/* Special properties */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
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
              </Grid>

              {/* Pendulum settings */}
              {cardData.Pendulum && (
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    {currentUi.pendulum_area}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label={currentUi.pendulum_blue}
                        type="number"
                        inputProps={{ min: 0, max: 12 }}
                        value={cardData.cardBLUE}
                        onChange={e =>
                          updateCardData({
                            cardBLUE: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label={currentUi.pendulum_red}
                        type="number"
                        inputProps={{ min: 0, max: 12 }}
                        value={cardData.cardRED}
                        onChange={e =>
                          updateCardData({
                            cardRED: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label={currentUi.text_size}
                        type="number"
                        value={cardData.pendulumSize}
                        onChange={e =>
                          updateCardData({
                            pendulumSize: parseInt(e.target.value) || 23,
                          })
                        }
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={5}
                        label={currentUi.card_info_text}
                        value={cardData.cardPendulumInfo}
                        onChange={e =>
                          updateCardData({ cardPendulumInfo: e.target.value })
                        }
                      />
                    </Grid>
                  </Grid>
                </Grid>
              )}

              {/* ATK/DEF/Link */}
              <Grid item xs={12}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label={currentUi.attack}
                      value={cardData.cardATK}
                      onChange={e =>
                        updateCardData({ cardATK: e.target.value })
                      }
                    />
                  </Grid>
                  {!isLinkMonster && (
                    <Grid item xs={4}>
                      <TextField
                        fullWidth
                        label={currentUi.defence}
                        value={cardData.cardDEF}
                        onChange={e =>
                          updateCardData({ cardDEF: e.target.value })
                        }
                      />
                    </Grid>
                  )}
                  {isLinkMonster && (
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" gutterBottom>
                        {currentUi.link}
                      </Typography>
                      <LinkGrid />
                    </Grid>
                  )}
                  <Grid item xs={4}>
                    <TextField
                      fullWidth
                      label={currentUi.text_size}
                      type="number"
                      value={cardData.infoSize}
                      onChange={e =>
                        updateCardData({ infoSize: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              </Grid>
            </>
          )}

          {/* Card Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={5}
              label={currentUi.card_info_text}
              value={cardData.cardInfo}
              onChange={e => updateCardData({ cardInfo: e.target.value })}
            />
          </Grid>

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSaveCard}
                >
                  Save Card
                </Button>
              </Grid>
              <Grid item>
                <Button variant="contained" color="info" onClick={onDrawCard}>
                  {currentUi.generate}
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default YugiohCardForm;

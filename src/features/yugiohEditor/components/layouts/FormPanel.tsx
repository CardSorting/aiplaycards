'use client';

import React from 'react';
import { Box, Divider, Paper, Typography } from '@mui/material';
import { LanguageConfig, UILanguage, YugiohCardData } from '../../types';

// Import sections
import BasicSettingsSection from '../sections/BasicSettingsSection';
import CardTypeSection from '../sections/CardTypeSection';
import MonsterStatsSection from '../sections/MonsterStatsSection';
import PendulumSection from '../sections/PendulumSection';
import CardTextSection from '../sections/CardTextSection';

interface FormPanelProps {
  cardData: YugiohCardData;
  updateCardData: (updates: Partial<YugiohCardData>) => void;
  ui: Record<string, UILanguage>;
  cardMeta: Record<string, LanguageConfig>;
  onDrawCard: () => void;
  onDownload: () => void;
  onReset: () => void;
}

const FormPanel: React.FC<FormPanelProps> = ({
  cardData,
  updateCardData,
  ui,
  cardMeta,
  onDrawCard,
  onDownload,
  onReset,
}) => {
  const _currentUi = ui[cardData.uiLang] || ui.en;

  return (
    <Paper
      elevation={2}
      sx={{
        backgroundColor: 'rgba(45, 45, 45, 0.95)',
        backgroundImage: `
          linear-gradient(135deg, rgba(45, 45, 45, 0.9) 0%, rgba(25, 25, 25, 0.9) 100%),
          url('/assets/yugioh/Screentone.png')
        `,
        backgroundSize: 'cover',
        backgroundBlendMode: 'multiply',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box textAlign="center" mb={3}>
          <Typography
            variant="h5"
            sx={{
              color: 'gold',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
              mb: 1,
            }}
          >
            🎴 Card Editor
          </Typography>
          <Typography
            variant="body2"
            sx={{
              color: 'rgba(255, 255, 255, 0.7)',
            }}
          >
            Customize your YuGiOh card
          </Typography>
          <Divider sx={{ mt: 2, borderColor: 'rgba(255, 215, 0, 0.3)' }} />
        </Box>

        <Box
          sx={{
            '& .MuiPaper-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            },
            '& .MuiTextField-root .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& fieldset': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'gold',
              },
            },
            '& .MuiSelect-root': {
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 215, 0, 0.5)',
              },
            },
            '& .MuiInputLabel-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-focused': {
                color: 'gold',
              },
            },
            '& .MuiInputBase-input': {
              color: 'white',
            },
            '& .MuiTypography-root': {
              color: 'white',
            },
            '& .MuiFormControlLabel-label': {
              color: 'rgba(255, 255, 255, 0.8)',
            },
            '& .MuiCheckbox-root': {
              color: 'rgba(255, 255, 255, 0.7)',
              '&.Mui-checked': {
                color: 'gold',
              },
            },
          }}
        >
          <BasicSettingsSection
            cardData={cardData}
            updateCardData={updateCardData}
            ui={ui}
            cardMeta={cardMeta}
          />

          <CardTypeSection
            cardData={cardData}
            updateCardData={updateCardData}
            ui={ui}
          />

          <MonsterStatsSection
            cardData={cardData}
            updateCardData={updateCardData}
            ui={ui}
          />

          <PendulumSection
            cardData={cardData}
            updateCardData={updateCardData}
            ui={ui}
          />

          <CardTextSection
            cardData={cardData}
            updateCardData={updateCardData}
            ui={ui}
            onDrawCard={onDrawCard}
            onDownload={onDownload}
            onReset={onReset}
          />
        </Box>
      </Box>
    </Paper>
  );
};

export default FormPanel;

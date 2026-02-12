'use client';

import { FC } from 'react';
import { Box, Chip } from '@mui/material';
import { CardDisplayWrapper } from '@components/CardDisplayWrapper';
import { CardData } from '@components/CardDisplayWrapper/types';
import { BoosterPack } from '../../../src/features/booster/packs';

type CardPresentationStageProps = {
  card: CardData;
  pack: BoosterPack;
  rarity: 'common' | 'uncommon' | 'rare';
  isNewCard?: boolean;
  aspectRatio?: string;
};

const CardPresentationStage: FC<CardPresentationStageProps> = ({
  card,
  pack,
  rarity,
  aspectRatio = '3/4',
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 400,
        padding: 2,
      }}
    >
      {/* Card Container */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 280, sm: 350, md: 500, lg: 600, xl: 700 },
          maxWidth: '100%',
          aspectRatio,
          zIndex: 10,
        }}
      >
        {/* The actual card */}
        <CardDisplayWrapper
          card={card}
          showFrame={true}
          width={{ xs: 280, sm: 350, md: 500, lg: 600, xl: 700 }}
          aspectRatio={aspectRatio}
        />

        {/* Simple Rarity Badge */}
        {rarity === 'rare' && (
          <Chip
            label="⭐ Rare"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              background: 'linear-gradient(135deg, #ffd700, #ffed4e)',
              color: '#1a1a1a',
              fontWeight: 700,
              zIndex: 15,
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default CardPresentationStage;

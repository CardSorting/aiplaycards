'use client';

import { FC, useState } from 'react';
import { Box } from '@mui/material';
import { BoosterPack } from '../../../src/features/booster/packs';

type AdvancedBoosterPackProps = {
  pack: BoosterPack;
  isShaking?: boolean;
  isCharging?: boolean;
  isOpening?: boolean;
  onClick?: () => void;
  disabled?: boolean;
};

const AdvancedBoosterPack: FC<AdvancedBoosterPackProps> = ({
  pack,
  onClick,
  disabled = false,
}) => {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <Box
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      sx={{
        position: 'relative',
        cursor: disabled ? 'not-allowed' : 'pointer',
        filter: disabled ? 'grayscale(50%) opacity(0.7)' : 'none',
        transition: 'all 0.3s ease',
        userSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      {/* Main Pack Container */}
      <Box
        sx={{
          position: 'relative',
          width: { xs: 260, md: 340 },
          height: { xs: 400, md: 520 },
          borderRadius: 3,
          overflow: 'hidden',
          background: pack.gradient,
          border: '3px solid rgba(255,255,255,0.2)',
          boxShadow: hovered
            ? '0 20px 40px rgba(0,0,0,0.3), 0 8px 20px rgba(0,0,0,0.2)'
            : '0 15px 30px rgba(0,0,0,0.2), 0 5px 15px rgba(0,0,0,0.1)',
          transform: hovered
            ? 'translateY(-5px) scale(1.02)'
            : 'translateY(0) scale(1)',
          transition: 'all 0.3s ease',
          zIndex: 1,
        }}
      >
        {/* Simple highlight on hover */}
        {hovered && (
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)',
              backgroundSize: '200% 200%',
              opacity: 0.6,
              zIndex: 2,
            }}
          />
        )}

        {/* Pack Surface Details */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 20,
            background: 'rgba(255,255,255,0.1)',
            zIndex: 3,
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 20,
            background: 'rgba(0,0,0,0.1)',
            zIndex: 3,
          }}
        />

        {/* Central Logo Area */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: 140, md: 180 },
            height: { xs: 140, md: 180 },
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(255,255,255,0.3) 45%, rgba(255,255,255,0.1) 60%, rgba(0,0,0,0.2) 100%)',
            boxShadow:
              '0 8px 24px rgba(0,0,0,0.2), inset 0 2px 8px rgba(255,255,255,0.4)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: { xs: '2.5rem', md: '3rem' },
            zIndex: 4,
          }}
        >
          {pack.emoji || '🎴'}
        </Box>
      </Box>
    </Box>
  );
};

export default AdvancedBoosterPack;

import { FC } from 'react';
import { Box, keyframes } from '@mui/material';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const BoosterCardBackSkeleton: FC = () => {
  return (
    <Box
      sx={{
        width: { xs: 280, md: 350 },
        height: { xs: 390, md: 490 },
        borderRadius: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '10px solid #fff',
        borderColor: 'primary.main',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
      }}
    >
      {/* Simple shimmer effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(to right, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
          animation: `${shimmer} 2s infinite`,
        }}
      />

      {/* Main card icon */}
      <Box
        sx={{
          width: '60%',
          height: '60%',
          borderRadius: '50%',
          border: '5px dashed',
          borderColor: 'primary.contrastText',
          opacity: 0.7,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '4rem',
          color: 'primary.contrastText',
          position: 'relative',
          zIndex: 2,
        }}
      >
        🎴
      </Box>
    </Box>
  );
};

export default BoosterCardBackSkeleton;

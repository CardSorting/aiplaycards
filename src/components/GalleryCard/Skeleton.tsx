import { FC } from 'react';
import { Box, Card, Skeleton } from '@mui/material';

const GalleryCardSkeleton: FC = () => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Card Display Container - matches actual card layout */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: 300,
          backgroundColor: '#f8f9fa',
        }}
      >
        <Box
          sx={{
            width: 200,
            maxWidth: 200,
            aspectRatio: '747/1038', // Match actual card aspect ratio
            position: 'relative',
          }}
        >
          <Skeleton
            variant="rectangular"
            sx={{
              width: '100%',
              height: '100%',
              borderRadius: 2,
            }}
          />
        </Box>
      </Box>

      {/* Card Info Section */}
      <Box sx={{ p: 2, pt: 1, flexGrow: 1 }}>
        <Skeleton variant="text" width="80%" height={28} sx={{ mb: 1 }} />

        {/* Chips skeleton */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={50} height={24} />
          <Skeleton variant="rounded" width={45} height={24} />
          <Skeleton variant="rounded" width={55} height={24} />
        </Box>

        <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={16} />
      </Box>

      {/* Actions Section */}
      <Box sx={{ p: 2, pt: 1 }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <Skeleton variant="rounded" height={36} sx={{ flexGrow: 1 }} />
          <Skeleton variant="circular" width={36} height={36} />
        </Box>
      </Box>
    </Card>
  );
};

export default GalleryCardSkeleton;

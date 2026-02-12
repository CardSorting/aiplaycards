'use client';

import { FC } from 'react';
import {
  Box,
  Card,
  Skeleton,
  Stack,
  useMediaQuery,
  useTheme,
} from '@mui/material';

const FeedSkeleton: FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Card
      elevation={0}
      sx={{
        mb: { xs: 2, sm: 3, md: 4 },
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: { xs: 2, sm: 3, md: 4 },
        overflow: 'hidden',
        ...(isMobile && {
          mx: 1,
          '&:first-of-type': {
            mt: 1,
          },
        }),
      }}
    >
      {/* Header skeleton */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 2.5 },
          borderBottom: '1px solid',
          borderColor: 'grey.100',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={{ xs: 2, sm: 2.5 }}>
          <Skeleton
            variant="circular"
            width={isMobile ? 40 : 44}
            height={isMobile ? 40 : 44}
          />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Skeleton
              variant="text"
              width="40%"
              height={isMobile ? 18 : 20}
              sx={{ mb: { xs: 0.25, sm: 0.5 } }}
            />
            <Skeleton variant="text" width="60%" height={isMobile ? 14 : 16} />
          </Box>
        </Stack>
      </Box>

      {/* Card skeleton */}
      <Box
        sx={{
          backgroundColor: 'grey.50',
          py: { xs: 2, sm: 3, md: 4 },
        }}
      >
        <Skeleton
          variant="rectangular"
          width={isMobile ? '90%' : '85%'}
          height={isMobile ? 320 : 400}
          sx={{
            mx: 'auto',
            borderRadius: { xs: 2, sm: 3 },
            aspectRatio: '747/1038',
          }}
        />
      </Box>

      {/* Actions and content skeleton */}
      <Box
        sx={{
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
        }}
      >
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1, md: 2 }}
          sx={{ mb: { xs: 1.5, sm: 2 } }}
        >
          <Skeleton
            variant="circular"
            width={isMobile ? 36 : 44}
            height={isMobile ? 36 : 44}
          />
          <Skeleton
            variant="circular"
            width={isMobile ? 36 : 44}
            height={isMobile ? 36 : 44}
          />
          <Skeleton
            variant="circular"
            width={isMobile ? 36 : 44}
            height={isMobile ? 36 : 44}
          />
        </Stack>
        <Skeleton
          variant="text"
          width="80%"
          height={isMobile ? 16 : 18}
          sx={{ mb: { xs: 0.5, sm: 1 } }}
        />
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            gap: { xs: 0.5, sm: 1 },
          }}
        >
          <Skeleton
            variant="rounded"
            width={isMobile ? 50 : 60}
            height={isMobile ? 20 : 24}
          />
          <Skeleton
            variant="rounded"
            width={isMobile ? 70 : 80}
            height={isMobile ? 20 : 24}
          />
          <Skeleton
            variant="rounded"
            width={isMobile ? 60 : 70}
            height={isMobile ? 20 : 24}
          />
        </Stack>
        <Stack
          direction="row"
          spacing={{ xs: 0.5, sm: 1 }}
          sx={{ gap: { xs: 0.5, sm: 1 } }}
        >
          <Skeleton
            variant="rounded"
            width={isMobile ? 80 : 100}
            height={isMobile ? 28 : 32}
          />
          <Skeleton
            variant="rounded"
            width={isMobile ? 100 : 120}
            height={isMobile ? 28 : 32}
          />
        </Stack>
      </Box>
    </Card>
  );
};

export default FeedSkeleton;

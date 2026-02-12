import React from 'react';
import { Box, Container, Grid, Skeleton, Stack } from '@mui/material';

export default function ProfileLoading() {
  return (
    <>
      {/* Profile Header Skeleton */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #f6f9fc, #eef2f7)',
          borderBottom: '1px solid #e5eaf2',
        }}
      >
        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={3}
          >
            {/* Avatar Skeleton */}
            <Skeleton variant="circular" width={80} height={80} />

            <Box sx={{ flex: 1 }}>
              {/* Username Skeleton */}
              <Skeleton variant="text" width={200} height={48} sx={{ mb: 1 }} />

              {/* Stats Chips Skeleton */}
              <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                <Skeleton variant="rounded" width={120} height={24} />
                <Skeleton variant="rounded" width={140} height={24} />
                <Skeleton variant="rounded" width={130} height={24} />
              </Stack>
            </Box>

            {/* Action Button Skeleton */}
            <Skeleton variant="rounded" width={120} height={36} />
          </Stack>
        </Container>
      </Box>

      {/* Tabs Skeleton */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="xl">
          <Stack direction="row" spacing={3} sx={{ py: 1 }}>
            <Skeleton variant="text" width={120} height={48} />
            <Skeleton variant="text" width={140} height={48} />
            <Skeleton variant="text" width={160} height={48} />
            <Skeleton variant="text" width={100} height={48} />
          </Stack>
        </Container>
      </Box>

      {/* Content Skeleton */}
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Cards Grid Skeleton */}
        <Grid container spacing={3}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Box
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  overflow: 'hidden',
                  bgcolor: 'background.paper',
                }}
              >
                {/* Card Image Skeleton */}
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={280}
                    sx={{ borderRadius: 1 }}
                  />
                </Box>

                {/* Card Content Skeleton */}
                <Box sx={{ p: 2 }}>
                  <Skeleton
                    variant="text"
                    width="80%"
                    height={24}
                    sx={{ mb: 1 }}
                  />
                  <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <Skeleton variant="rounded" width={60} height={24} />
                    <Skeleton variant="rounded" width={70} height={24} />
                  </Stack>
                  <Skeleton variant="text" width="60%" height={16} />
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Loading Indicator */}
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            justifyContent="center"
          >
            <Skeleton variant="circular" width={20} height={20} />
            <Skeleton variant="text" width={100} height={20} />
          </Stack>
        </Box>
      </Container>
    </>
  );
}

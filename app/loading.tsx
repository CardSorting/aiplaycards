'use client';

import {
  Box,
  Container,
  Grid,
  Skeleton,
  Stack,
  useMediaQuery,
} from '@mui/material';

export default function Loading() {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const anim = reduceMotion ? false : 'wave';

  return (
    <Box component="div" sx={{ py: { xs: 6, md: 10 } }}>
      <Container maxWidth="lg">
        {/* Hero skeleton */}
        <Grid
          container
          spacing={6}
          alignItems="center"
          sx={{ mb: { xs: 4, md: 6 } }}
        >
          <Grid item xs={12} md={6}>
            <Stack spacing={1.5}>
              <Skeleton
                variant="text"
                width="80%"
                height={48}
                animation={anim}
              />
              <Skeleton
                variant="text"
                width="90%"
                height={28}
                animation={anim}
              />
              <Skeleton
                variant="text"
                width="60%"
                height={24}
                animation={anim}
              />
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <Skeleton
                  variant="rounded"
                  width={180}
                  height={48}
                  animation={anim}
                />
                <Skeleton
                  variant="rounded"
                  width={140}
                  height={48}
                  animation={anim}
                />
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rounded"
              width="100%"
              height={reduceMotion ? 300 : 360}
              animation={anim}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>

        {/* Community grid skeleton */}
        <Grid
          container
          spacing={3}
          role="status"
          aria-label="Loading recent community items"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Stack spacing={1.25}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton
                    variant="circular"
                    width={28}
                    height={28}
                    animation={anim}
                  />
                  <Skeleton
                    variant="text"
                    width={120}
                    height={16}
                    animation={anim}
                  />
                </Stack>
                <Skeleton
                  variant="rounded"
                  width="100%"
                  height={120}
                  animation={anim}
                />
                <Skeleton
                  variant="text"
                  width="70%"
                  height={18}
                  animation={anim}
                />
                <Skeleton
                  variant="text"
                  width="40%"
                  height={14}
                  animation={anim}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

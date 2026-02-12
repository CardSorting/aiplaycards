'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Box, Card, CardContent, Skeleton, Stack } from '@mui/material';
import { LazyCardRendererProps } from './types';

/**
 * Reusable lazy loading card component with intersection observer
 * Can be used across multiple pages for consistent performance optimization
 */
export const LazyCardRenderer: React.FC<LazyCardRendererProps> = ({
  card: _card,
  isLoaded,
  onLoad,
  children,
  skeletonHeight = 500,
  threshold = 0.1,
  rootMargin = '50px',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasIntersected) {
          setIsVisible(true);
          setHasIntersected(true);
          onLoad();
        }
      },
      {
        threshold,
        rootMargin,
      },
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [hasIntersected, onLoad, threshold, rootMargin]);

  return (
    <div ref={cardRef}>
      {isVisible || isLoaded ? (
        children
      ) : (
        <Card>
          <Box
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: skeletonHeight,
              backgroundColor: '#f8f9fa',
            }}
          >
            <Skeleton
              variant="rectangular"
              width={200}
              height={278}
              sx={{ borderRadius: 2 }}
            />
          </Box>
          <CardContent>
            <Skeleton width="80%" height={24} sx={{ mb: 1 }} />
            <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
              <Skeleton width={60} height={24} />
              <Skeleton width={60} height={24} />
            </Stack>
            <Stack direction="row" spacing={1}>
              <Skeleton width="45%" height={36} />
              <Skeleton width="45%" height={36} />
            </Stack>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

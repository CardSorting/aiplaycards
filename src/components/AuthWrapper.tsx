'use client';

import { useEffect } from 'react';
import { useAuth } from '../../app/AuthProvider';
import { useRouter } from 'next/navigation';
import { Alert, Box, CircularProgress, Container } from '@mui/material';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  redirectTo?: string;
}

export default function AuthWrapper({
  children,
  fallbackMessage = 'Please sign in to access this page.',
  redirectTo = '/signin',
}: AuthWrapperProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Still loading

    if (!user) {
      // Redirect to sign in page with the current page as callback
      const currentPath = window.location.pathname;
      const callbackUrl = currentPath !== '/signin' ? currentPath : '/';
      router.push(
        `${redirectTo}?callbackUrl=${encodeURIComponent(callbackUrl)}`,
      );
      return;
    }
  }, [user, router, loading, redirectTo]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <CircularProgress />
          <span>Loading...</span>
        </Box>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">{fallbackMessage}</Alert>
      </Container>
    );
  }

  return <>{children}</>;
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  Typography,
} from '@mui/material';
import { ArrowBack, MonetizationOn } from '@mui/icons-material';

export default function CreditPackagePage() {
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Auto-redirect after a brief delay
    const timer = setTimeout(() => {
      setRedirecting(true);
      router.push('/credits');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper
        elevation={0}
        sx={{
          p: 6,
          textAlign: 'center',
          bgcolor: 'background.default',
          borderRadius: 4,
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        }}
      >
        <MonetizationOn sx={{ fontSize: 80, color: 'primary.main', mb: 3 }} />
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Free Credits System
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 3, lineHeight: 1.6 }}
        >
          We have replaced the credit purchase system with a free credit
          claiming system! Now you can claim credits daily without any payment
          required.
        </Typography>

        <Alert severity="info" sx={{ mb: 3, fontSize: '1rem' }}>
          No more purchases needed! Credits are now 100% free and renewable
          daily.
        </Alert>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Redirecting you to the free credits page in a moment...
          </Typography>
          {redirecting && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ mt: 1, fontWeight: 600 }}
            >
              Redirecting now...
            </Typography>
          )}
        </Box>

        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/credits')}
          sx={{
            background: 'linear-gradient(45deg, #667eea, #764ba2)',
            '&:hover': {
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
            },
          }}
        >
          Go to Free Credits
        </Button>
      </Paper>
    </Container>
  );
}

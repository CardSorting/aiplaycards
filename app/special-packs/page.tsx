'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import StyleIcon from '@mui/icons-material/Style';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import { urlFriendlySlug } from '../../src/routes';

interface SpecialPackCategory {
  id: number;
  name: string;
  description?: string | null;
  color: string | null;
  packCount: number;
}

export default function SpecialPacksPage() {
  const [categories, setCategories] = useState<SpecialPackCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/special-packs/categories');
      const data = await response.json();

      if (response.ok) {
        setCategories(data.categories || []);
        setError(null);
      } else {
        setError(data.error || 'Failed to load PlayMore packs');
      }
    } catch (err) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const getCategorySlug = (category: SpecialPackCategory) => {
    if (category.id === 0) {
      return 'special';
    }
    return urlFriendlySlug(category.name);
  };

  const getCategoryColor = (color: string | null | undefined) => {
    return color || '#1976d2';
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your PlayMore packs...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box textAlign="center">
          <Typography variant="h3" fontWeight={800} gutterBottom>
            🎁 PlayMore Packs
          </Typography>
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ maxWidth: 600, mx: 'auto' }}
          >
            Discover exclusive card collections created just for you! Each pack
            contains unique cards organized by theme and rarity.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {categories.length === 0 && !loading && !error && (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <GiftIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No PlayMore Packs Available
              </Typography>
              <Typography variant="body1" color="text.secondary">
                PlayMore packs haven't been created for your account yet. Check
                back soon for exclusive card collections!
              </Typography>
            </CardContent>
          </Card>
        )}

        {categories.length > 0 && (
          <>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{ textAlign: 'center' }}
            >
              Available Collections
            </Typography>

            <Grid container spacing={3}>
              {categories.map(category => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      border: '2px solid transparent',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                        borderColor: getCategoryColor(category.color),
                      },
                    }}
                    onClick={() =>
                      router.push(`/special-packs/${getCategorySlug(category)}`)
                    }
                  >
                    <CardContent sx={{ flexGrow: 1, p: 3 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 2 }}
                      >
                        <Box
                          sx={{
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(category.color),
                            mr: 1.5,
                          }}
                        />
                        <Typography variant="h6" fontWeight={700}>
                          {category.name}
                        </Typography>
                      </Box>

                      {category.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mb: 2, lineHeight: 1.6 }}
                        >
                          {category.description}
                        </Typography>
                      )}

                      <Chip
                        icon={<StyleIcon />}
                        label={`${category.packCount} pack${
                          category.packCount !== 1 ? 's' : ''
                        } available`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </CardContent>

                    <CardActions sx={{ p: 3, pt: 0 }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{
                          backgroundColor: getCategoryColor(category.color),
                          '&:hover': {
                            backgroundColor: getCategoryColor(category.color),
                            filter: 'brightness(0.9)',
                          },
                        }}
                      >
                        View Collection
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}

        <Box
          textAlign="center"
          sx={{ mt: 6, p: 4, bgcolor: 'background.paper', borderRadius: 2 }}
        >
          <Typography variant="h6" gutterBottom>
            What are PlayMore Packs?
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ maxWidth: 800, mx: 'auto' }}
          >
            PlayMore packs are curated card collections featuring unique
            artwork, themes, and rarities. Each pack is carefully crafted and
            assigned to specific players, making them truly exclusive. Unlike
            regular booster packs, these collections are pre-made with specific
            cards chosen for their quality and theme.
          </Typography>
        </Box>
      </Stack>
    </Container>
  );
}

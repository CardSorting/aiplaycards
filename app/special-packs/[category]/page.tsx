'use client';

import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  Grid,
  Link,
  Stack,
  Typography,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StyleIcon from '@mui/icons-material/Style';
import GiftIcon from '@mui/icons-material/CardGiftcard';
import StarIcon from '@mui/icons-material/Star';
import CreditCardIcon from '@mui/icons-material/CreditCard';

interface SpecialPack {
  id: number;
  categoryId?: number | null;
  categoryName?: string;
  categoryColor?: string | null;
  creditCost?: number;
  cards: Array<{
    id: number;
    name: string;
    imageUrl: string;
    rarity: string;
  }>;
  createdAt: string;
}

interface PackDialogState {
  open: boolean;
  pack: SpecialPack | null;
}

export default function SpecialPackCategoryPage() {
  const [packs, setPacks] = useState<SpecialPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [packDialog, setPackDialog] = useState<PackDialogState>({
    open: false,
    pack: null,
  });

  const router = useRouter();
  const params = useParams();
  const category = params.category as string;

  useEffect(() => {
    if (category) {
      loadPacks();
    }
  }, [category]);

  const loadPacks = async () => {
    try {
      const response = await fetch(`/api/special-packs/${category}`);
      const data = await response.json();

      if (response.ok) {
        setPacks(data.packs || []);
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

  const handleViewPack = (pack: SpecialPack) => {
    setPackDialog({ open: true, pack });
  };

  const getCategoryDisplayName = () => {
    if (category === 'special' || category === 'uncategorized') {
      return 'Special Cards';
    }
    return (
      packs[0]?.categoryName ||
      category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
  };

  const getCategoryColor = (color: string | null | undefined) => {
    return color || '#1976d2';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return '#9e9e9e';
      case 'uncommon':
        return '#4caf50';
      case 'rare':
        return '#2196f3';
      case 'epic':
        return '#9c27b0';
      case 'legendary':
        return '#ff9800';
      default:
        return '#1976d2';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your {getCategoryDisplayName()} collection...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            onClick={() => router.push('/special-packs')}
            sx={{
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            PlayMore Packs
          </Link>
          <Typography color="text.primary">
            {getCategoryDisplayName()}
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/special-packs')}
            sx={{ mb: 2 }}
          >
            Back to Collections
          </Button>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            {packs[0]?.categoryColor && (
              <Box
                sx={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  backgroundColor: getCategoryColor(packs[0].categoryColor),
                  mr: 2,
                }}
              />
            )}
            <Typography variant="h3" fontWeight={800}>
              {getCategoryDisplayName()}
            </Typography>
          </Box>

          <Typography variant="h6" color="text.secondary">
            {packs.length} exclusive pack{packs.length !== 1 ? 's' : ''}{' '}
            available
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {packs.length === 0 && !loading && !error && (
          <Card sx={{ textAlign: 'center', py: 6 }}>
            <CardContent>
              <GiftIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                No Packs in This Collection
              </Typography>
              <Typography variant="body1" color="text.secondary">
                This collection doesn't have any packs available yet.
              </Typography>
            </CardContent>
          </Card>
        )}

        {packs.length > 0 && (
          <Grid container spacing={3}>
            {packs.map((pack, index) => (
              <Grid item xs={12} sm={6} md={4} key={pack.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  <CardMedia
                    sx={{
                      height: 200,
                      background: `linear-gradient(45deg, ${getCategoryColor(
                        pack.categoryColor,
                      )}, ${getCategoryColor(pack.categoryColor)}80)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                    }}
                  >
                    <StyleIcon
                      sx={{ fontSize: 60, color: 'white', opacity: 0.9 }}
                    />
                    <Chip
                      icon={<StarIcon />}
                      label="Special"
                      size="small"
                      sx={{
                        position: 'absolute',
                        top: 12,
                        right: 12,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        fontWeight: 'bold',
                      }}
                    />
                  </CardMedia>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                      PlayMore Pack #{index + 1}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      Created: {new Date(pack.createdAt).toLocaleDateString()}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      flexWrap="wrap"
                      useFlexGap
                    >
                      <Chip
                        label={`${pack.cards.length} cards`}
                        size="small"
                        variant="outlined"
                      />
                      {pack.creditCost && (
                        <Chip
                          icon={<CreditCardIcon />}
                          label={`${pack.creditCost} credits`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      )}
                      {Array.from(new Set(pack.cards.map(c => c.rarity))).map(
                        rarity => (
                          <Chip
                            key={rarity}
                            label={rarity}
                            size="small"
                            sx={{
                              backgroundColor: getRarityColor(rarity),
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '0.7rem',
                            }}
                          />
                        ),
                      )}
                    </Stack>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Stack spacing={1}>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleViewPack(pack)}
                        sx={{
                          backgroundColor: getCategoryColor(pack.categoryColor),
                          '&:hover': {
                            backgroundColor: getCategoryColor(
                              pack.categoryColor,
                            ),
                            filter: 'brightness(0.9)',
                          },
                        }}
                      >
                        View Cards
                      </Button>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() =>
                          router.push(`/special-packs/pack/${pack.id}`)
                        }
                      >
                        Open Pack
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>

      {/* Pack Detail Dialog */}
      <Dialog
        open={packDialog.open}
        onClose={() => setPackDialog({ open: false, pack: null })}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <StyleIcon
              sx={{
                mr: 1,
                color: getCategoryColor(packDialog.pack?.categoryColor),
              }}
            />
            PlayMore Pack Cards
          </Box>
        </DialogTitle>
        <DialogContent>
          {packDialog.pack && (
            <Grid container spacing={2}>
              {packDialog.pack.cards.map(card => (
                <Grid item xs={6} sm={4} md={3} key={card.id}>
                  <Card sx={{ textAlign: 'center' }}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={card.imageUrl}
                      alt={card.name}
                      sx={{ objectFit: 'cover' }}
                    />
                    <CardContent sx={{ p: 1.5 }}>
                      <Typography variant="body2" fontWeight={600} noWrap>
                        {card.name}
                      </Typography>
                      <Chip
                        label={card.rarity}
                        size="small"
                        sx={{
                          mt: 0.5,
                          backgroundColor: getRarityColor(card.rarity),
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '0.7rem',
                        }}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPackDialog({ open: false, pack: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

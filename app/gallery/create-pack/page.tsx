'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Link as MUILink,
  Paper,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CardData,
  CardDisplayWrapper,
  normalizeCardData,
  useCardLoadingState,
  usePagination,
} from '@components/CardDisplayWrapper';

interface UserCard extends CardData {
  isPublic: boolean;
  createdAt: string;
  selected?: boolean;
  weight?: number;
}

const steps = ['Select Cards', 'Configure Pack', 'Review & Create'];

export default function CreatePackPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);

  // Card selection state
  const [cards, setCards] = useState<UserCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pack configuration state
  const [packName, setPackName] = useState('');
  const [packDescription, setPackDescription] = useState('');
  const [packSize, setPackSize] = useState(5);
  const [totalPacks, setTotalPacks] = useState(10);

  // UI state
  const [previewDialog, setPreviewDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  const { handleCardLoad, isCardLoaded } = useCardLoadingState();
  const { page, setPage, total, setTotal, itemsPerPage } = usePagination(20);

  const fetchUserCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      const offset = (page - 1) * itemsPerPage;
      const response = await fetch(
        `/api/cards?userId=${user.id}&isPublic=true&limit=${itemsPerPage}&offset=${offset}&view=summary`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch cards');
      }
      const data = await response.json();

      const normalizedCards: UserCard[] = Array.isArray(data.data)
        ? data.data.map((card: any) => ({
            ...normalizeCardData(card),
            isPublic: card.isPublic,
            createdAt: card.createdAt,
            selected: false,
            weight: 1,
          }))
        : [];

      setCards(normalizedCards);
      setTotal(data.total || normalizedCards.length || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cards');
    } finally {
      setLoading(false);
    }
  }, [user, page, itemsPerPage]);

  useEffect(() => {
    fetchUserCards();
  }, [fetchUserCards]);

  const toggleCardSelection = (card: UserCard) => {
    const isSelected = selectedCards.some(c => c.id === card.id);

    if (isSelected) {
      setSelectedCards(prev => prev.filter(c => c.id !== card.id));
    } else {
      setSelectedCards(prev => [
        ...prev,
        { ...card, selected: true, weight: 1 },
      ]);
    }
  };

  const updateCardWeight = (cardId: number, weight: number) => {
    setSelectedCards(prev =>
      prev.map(card =>
        card.id === cardId ? { ...card, weight: Math.max(1, weight) } : card,
      ),
    );
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleCreatePack = async () => {
    if (!user || selectedCards.length === 0) return;

    setCreating(true);
    try {
      const packData = {
        name: packName,
        description: packDescription,
        packSize,
        totalPacks,
        cards: selectedCards.map(card => ({
          cardId: card.id,
          weight: card.weight || 1,
        })),
      };

      const response = await fetch('/api/booster-packs/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(packData),
      });

      if (!response.ok) {
        throw new Error('Failed to create pack');
      }

      const result = await response.json();
      router.push(`/gallery/packs/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pack');
    } finally {
      setCreating(false);
    }
  };

  const canProceed = () => {
    switch (activeStep) {
      case 0: // Select Cards
        return selectedCards.length >= packSize;
      case 1: // Configure Pack
        return packName.trim() !== '' && packSize > 0 && totalPacks > 0;
      case 2: // Review
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Select Cards for Your Pack ({selectedCards.length} selected)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Choose at least {packSize} cards from your collection. These cards
              will be randomly included when someone opens your pack.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={2}>
              {loading
                ? Array.from({ length: 8 }).map((_, idx) => (
                    <Grid item xs={6} sm={4} md={3} key={idx}>
                      <Card>
                        <Box
                          sx={{
                            height: 200,
                            bgcolor: 'grey.200',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <CircularProgress />
                        </Box>
                        <CardContent>
                          <Box sx={{ height: 60 }} />
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                : cards.map(card => {
                    const isSelected = selectedCards.some(
                      c => c.id === card.id,
                    );
                    return (
                      <Grid item xs={6} sm={4} md={3} key={card.id}>
                        <Card
                          sx={{
                            position: 'relative',
                            border: isSelected ? 2 : 0,
                            borderColor: 'primary.main',
                            cursor: 'pointer',
                            '&:hover': { boxShadow: 4 },
                          }}
                          onClick={() => toggleCardSelection(card)}
                        >
                          <Box
                            sx={{
                              p: 1,
                              backgroundColor: '#f8f9fa',
                              display: 'flex',
                              justifyContent: 'center',
                            }}
                          >
                            <CardDisplayWrapper
                              card={card}
                              width="responsive"
                              showFrame={true}
                              disableParallax={true}
                            />
                          </Box>

                          <Checkbox
                            checked={isSelected}
                            sx={{
                              position: 'absolute',
                              top: 8,
                              right: 8,
                              bgcolor: 'rgba(255, 255, 255, 0.9)',
                              '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
                            }}
                          />

                          <CardContent>
                            <Typography variant="subtitle2" noWrap>
                              {card.name}
                            </Typography>
                            <Chip label={card.type} size="small" />
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
            </Grid>

            {total > itemsPerPage && (
              <Stack alignItems="center" sx={{ mt: 4 }}>
                <Button
                  variant="outlined"
                  onClick={() => setPage(prev => prev + 1)}
                  disabled={page * itemsPerPage >= total}
                >
                  Load More Cards
                </Button>
              </Stack>
            )}
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Configure Your Pack
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up the basic details and distribution for your custom booster
              pack.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pack Name"
                  value={packName}
                  onChange={e => setPackName(e.target.value)}
                  required
                  helperText="Give your pack a unique and memorable name"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Cards per Pack"
                  type="number"
                  value={packSize}
                  onChange={e =>
                    setPackSize(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  inputProps={{ min: 1, max: selectedCards.length }}
                  helperText={`Maximum: ${selectedCards.length} (selected cards)`}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Pack Description"
                  value={packDescription}
                  onChange={e => setPackDescription(e.target.value)}
                  helperText="Describe what makes this pack special"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Total Packs Available"
                  type="number"
                  value={totalPacks}
                  onChange={e =>
                    setTotalPacks(Math.max(1, parseInt(e.target.value) || 1))
                  }
                  inputProps={{ min: 1 }}
                  helperText="How many packs will be available for opening/purchase"
                />
              </Grid>
            </Grid>

            <Paper sx={{ p: 3, mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Card Weights
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Adjust the probability of each card appearing in packs. Higher
                weights mean more likely to appear.
              </Typography>

              <Grid container spacing={2}>
                {selectedCards.map(card => (
                  <Grid item xs={12} sm={6} key={card.id}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box sx={{ minWidth: 100 }}>
                        <Typography variant="body2" noWrap>
                          {card.name}
                        </Typography>
                      </Box>
                      <TextField
                        size="small"
                        type="number"
                        value={card.weight || 1}
                        onChange={e =>
                          updateCardWeight(
                            card.id,
                            parseInt(e.target.value) || 1,
                          )
                        }
                        inputProps={{ min: 1, max: 10 }}
                        sx={{ width: 80 }}
                      />
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Pack
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Review all the details before creating your custom booster pack.
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Pack Details
                  </Typography>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1">{packName}</Typography>
                    </Box>

                    {packDescription && (
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Description
                        </Typography>
                        <Typography variant="body1">
                          {packDescription}
                        </Typography>
                      </Box>
                    )}

                    <Stack direction="row" spacing={4}>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Cards per Pack
                        </Typography>
                        <Typography variant="body1">{packSize}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Packs
                        </Typography>
                        <Typography variant="body1">{totalPacks}</Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Total Cards
                        </Typography>
                        <Typography variant="body1">
                          {selectedCards.length}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Card Preview
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedCards.slice(0, 6).map((card, idx) => (
                      <Grid item xs={4} key={card.id}>
                        <Box
                          sx={{
                            aspectRatio: '5/7',
                            overflow: 'hidden',
                            borderRadius: 1,
                            position: 'relative',
                          }}
                        >
                          <CardDisplayWrapper
                            card={card}
                            width="responsive"
                            showFrame={true}
                            disableParallax={true}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  {selectedCards.length > 6 && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      +{selectedCards.length - 6} more cards
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return null;
    }
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You need to be logged in to create custom booster packs.
        </Typography>
        <Button
          component={Link}
          href="/gallery"
          variant="contained"
          size="large"
        >
          Go to Gallery
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={4}>
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <MUILink component={Link} href="/">
              Home
            </MUILink>
            <MUILink component={Link} href="/gallery">
              Gallery
            </MUILink>
            <Typography color="text.primary">Create Pack</Typography>
          </Breadcrumbs>

          <Typography variant="h3" component="h1" gutterBottom>
            Create Custom Booster Pack
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create your own booster pack using cards from your collection
          </Typography>
        </Box>

        <Paper sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map(label => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStepContent()}

          <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
            <Button
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
            >
              Back
            </Button>

            <Box sx={{ flex: 1 }} />

            {activeStep < steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!canProceed()}
                endIcon={<ArrowForwardIcon />}
              >
                Next
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleCreatePack}
                disabled={creating || !canProceed()}
                startIcon={
                  creating ? <CircularProgress size={20} /> : <SaveIcon />
                }
              >
                {creating ? 'Creating...' : 'Create Pack'}
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}

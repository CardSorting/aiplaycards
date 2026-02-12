'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Alert,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Link as MUILink,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CardGiftcard as CardGiftcardIcon,
  CalendarToday as DateIcon,
  Inventory as InventoryIcon,
  CardGiftcard as PackIcon,
  Person as PersonIcon,
  Share as ShareIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { CardData, CardDisplayWrapper } from '@components/CardDisplayWrapper';

interface BoosterPackDetail {
  id: number;
  packId: number;
  name: string;
  description?: string;
  packSize: number;
  packsAvailable: number;
  priceCredits: number;
  priceUsd: string;
  sellerUserId: string;
  sellerUsername?: string;
  createdAt: string;
  previewCards: CardData[];
  totalCards: number;
}

export default function BoosterPackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user;

  const [pack, setPack] = useState<BoosterPackDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseDialog, setPurchaseDialog] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [creditError, setCreditError] = useState<string | null>(null);

  // Fetch user credits when component mounts
  useEffect(() => {
    const fetchUserCredits = async () => {
      if (user?.id) {
        try {
          const response = await fetch('/api/user/credits');
          if (response.ok) {
            const data = await response.json();
            setUserCredits(data.credits);
          }
        } catch (error) {
          console.error('Failed to fetch user credits:', error);
        }
      }
    };

    fetchUserCredits();
  }, [user?.id]);

  useEffect(() => {
    const fetchPackDetails = async () => {
      if (!params.id) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/marketplace/booster-packs/${params.id}`,
        );
        if (!response.ok) {
          if (response.status === 404) {
            setError('Booster pack not found');
          } else {
            throw new Error('Failed to fetch pack details');
          }
          return;
        }

        const data = await response.json();
        setPack(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load pack details',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPackDetails();
  }, [params.id]);

  const handlePurchase = async () => {
    if (!user || !pack) return;

    setCreditError(null);
    setPurchasing(true);

    try {
      const response = await fetch(
        `/api/marketplace/booster-packs/${pack.id}/purchase`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 402) {
          // Credit-related error
          setCreditError(result.error || 'Insufficient credits for purchase');
          setPurchasing(false);
          return;
        } else if (response.status === 401) {
          setCreditError('Please sign in to make purchases');
          setPurchasing(false);
          return;
        } else {
          throw new Error(result.error || 'Purchase failed');
        }
      }

      // Update user credits after successful purchase
      if (userCredits !== null) {
        setUserCredits(userCredits - pack.priceCredits * quantity);
      }

      // Redirect to the opening page or show success
      router.push(`/booster/opening/${result.jobId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Purchase failed');
      setPurchasing(false);
      setPurchaseDialog(false);
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this custom booster pack: ${pack?.name}`;

    if (navigator.share) {
      navigator
        .share({
          title: pack?.name,
          text,
          url,
        })
        .catch(err => console.error('Share failed:', err));
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${text} ${url}`);
      // Could show a toast notification here
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress size={64} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/marketplace')}
          variant="outlined"
        >
          Back to Marketplace
        </Button>
      </Container>
    );
  }

  if (!pack) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">Booster pack not found</Alert>
      </Container>
    );
  }

  const totalPrice = parseFloat(pack.priceUsd) * quantity;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <MUILink component={Link} href="/">
              Home
            </MUILink>
            <MUILink component={Link} href="/marketplace">
              Marketplace
            </MUILink>
            <Typography color="text.primary">Booster Pack</Typography>
          </Breadcrumbs>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/marketplace?tab=packs')}
              variant="outlined"
              size="small"
            >
              Back
            </Button>

            <Box flex={1} />

            <IconButton onClick={handleShare} size="small">
              <ShareIcon />
            </IconButton>
          </Stack>
        </Box>

        <Grid container spacing={4}>
          {/* Pack Details */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 4 }}>
              {/* Pack Header */}
              <Box
                sx={{
                  background:
                    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  p: 4,
                  borderRadius: 2,
                  color: 'white',
                  textAlign: 'center',
                  mb: 4,
                }}
              >
                <PackIcon sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  {pack.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Custom Booster Pack • {pack.packSize} cards per pack
                </Typography>
              </Box>

              {/* Pack Info */}
              <Stack spacing={3}>
                {pack.description && (
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {pack.description}
                    </Typography>
                  </Box>
                )}

                <Box>
                  <Typography variant="h6" gutterBottom>
                    Pack Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" spacing={1}>
                        <InventoryIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {pack.packSize}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                        >
                          Cards per pack
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" spacing={1}>
                        <PackIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {pack.packsAvailable}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                        >
                          Packs available
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" spacing={1}>
                        <CardGiftcardIcon color="primary" />
                        <Typography variant="h6" fontWeight={600}>
                          {pack.totalCards}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                        >
                          Total unique cards
                        </Typography>
                      </Stack>
                    </Grid>

                    <Grid item xs={6} sm={3}>
                      <Stack alignItems="center" spacing={1}>
                        <DateIcon color="primary" />
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          textAlign="center"
                        >
                          {new Date(pack.createdAt).toLocaleDateString()}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          textAlign="center"
                        >
                          Listed
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {/* Seller Info */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Seller
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Avatar>
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight={600}>
                        {pack.sellerUsername || 'Anonymous'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pack Creator
                      </Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Preview Cards */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Card Preview ({pack.previewCards.length} of{' '}
                    {pack.totalCards})
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 2 }}
                  >
                    Here's a preview of some cards you might find in this pack
                  </Typography>
                  <Grid container spacing={2}>
                    {pack.previewCards.map((card, idx) => (
                      <Grid item xs={6} sm={4} md={3} key={idx}>
                        <Card sx={{ aspectRatio: '5/7' }}>
                          <Box
                            sx={{
                              height: '100%',
                              p: 1,
                              bgcolor: '#f8f9fa',
                              display: 'flex',
                              alignItems: 'center',
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
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Purchase Panel */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
              <Stack spacing={3}>
                <Box textAlign="center">
                  <Typography
                    variant="h4"
                    fontWeight={700}
                    color="success.main"
                  >
                    ${parseFloat(pack.priceUsd).toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    per pack
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Available: {pack.packsAvailable} packs
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                    <Chip
                      size="small"
                      label={`${pack.packSize} cards`}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      label="Custom pack"
                      color="primary"
                      variant="outlined"
                    />
                  </Stack>
                </Box>

                <Stack spacing={2}>
                  {user ? (
                    pack.packsAvailable > 0 ? (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        startIcon={<ShoppingCartIcon />}
                        onClick={() => setPurchaseDialog(true)}
                        disabled={
                          pack.sellerUserId === user.id ||
                          (userCredits !== null &&
                            userCredits < pack.priceCredits)
                        }
                      >
                        {pack.sellerUserId === user.id
                          ? 'Your Own Pack'
                          : userCredits !== null &&
                            userCredits < pack.priceCredits
                          ? `Need ${pack.priceCredits} Credits`
                          : 'Open Pack'}
                      </Button>
                    ) : (
                      <Button
                        fullWidth
                        variant="outlined"
                        size="large"
                        disabled
                      >
                        Sold Out
                      </Button>
                    )
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      component={Link}
                      href="/auth/signin"
                    >
                      Sign in to Purchase
                    </Button>
                  )}

                  {/* Credit status and error display */}
                  {user && (
                    <Box sx={{ textAlign: 'center' }}>
                      {userCredits !== null && (
                        <Typography variant="caption" color="text.secondary">
                          Your credits: {userCredits}
                        </Typography>
                      )}
                      {creditError && (
                        <Alert
                          severity="warning"
                          sx={{ mt: 1, fontSize: '0.875rem' }}
                        >
                          {creditError}
                          {userCredits !== null &&
                            userCredits < pack.priceCredits && (
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  component={Link}
                                  href="/credits"
                                  size="small"
                                  variant="text"
                                  color="inherit"
                                >
                                  Get more credits
                                </Button>
                              </Box>
                            )}
                        </Alert>
                      )}
                    </Box>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Stack>

      {/* Purchase Dialog */}
      <Dialog
        open={purchaseDialog}
        onClose={() => setPurchaseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Open Booster Pack</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 1 }}>
            <Box>
              <Typography variant="h6" gutterBottom>
                {pack.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Each pack contains {pack.packSize} random cards from this
                collection
              </Typography>
            </Box>

            <Box>
              <Typography variant="h6" color="success.main">
                ${parseFloat(pack.priceUsd).toFixed(2)} per pack
              </Typography>
            </Box>

            <Alert severity="info">
              You'll receive {pack.packSize} random cards from this custom pack.
              The pack will open immediately after purchase.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPurchaseDialog(false)}>Cancel</Button>
          <Button
            onClick={handlePurchase}
            variant="contained"
            disabled={purchasing}
            startIcon={
              purchasing ? <CircularProgress size={20} /> : <ShoppingCartIcon />
            }
          >
            {purchasing ? 'Opening...' : 'Open Pack'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

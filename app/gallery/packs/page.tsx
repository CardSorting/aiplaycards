'use client';
import { useSession } from 'next-auth/react';

import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Link as MUILink,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  AttachMoney as MoneyIcon,
  CardGiftcard as PackIcon,
  Store as StoreIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CustomPack {
  id: number;
  name: string;
  description?: string;
  packSize: number;
  totalPacks: number;
  remainingPacks: number;
  createdAt: string;
  isActive: boolean;
  listing?: {
    id: number;
    priceCredits: number;
    priceUsd: string;
    packsAvailable: number;
    status: string;
  };
}

export default function CustomPacksPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [packs, setPacks] = useState<CustomPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listing dialog state
  const [listingDialog, setListingDialog] = useState<{
    open: boolean;
    pack: CustomPack | null;
  }>({ open: false, pack: null });
  const [listingForm, setListingForm] = useState({
    priceCredits: 100,
    priceUsd: '1.00',
    packsAvailable: 1,
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPacks = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/booster-packs/custom?userId=${user.id}`,
      );
      if (!response.ok) {
        throw new Error('Failed to fetch packs');
      }
      const data = await response.json();
      setPacks(Array.isArray(data.data) ? data.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load packs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, [user]);

  const handleCreateListing = async () => {
    if (!listingDialog.pack) return;

    setSubmitting(true);
    try {
      const response = await fetch(
        `/api/booster-packs/custom/${listingDialog.pack.id}/list`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(listingForm),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create listing');
      }

      // Refresh the packs list
      await fetchPacks();

      setListingDialog({ open: false, pack: null });
      setListingForm({
        priceCredits: 100,
        priceUsd: '1.00',
        packsAvailable: 1,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  const openListingDialog = (pack: CustomPack) => {
    setListingDialog({ open: true, pack });
    setListingForm({
      priceCredits: 100,
      priceUsd: '1.00',
      packsAvailable: Math.min(pack.remainingPacks, 10),
    });
  };

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Login Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          You need to be logged in to manage your custom booster packs.
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
        {/* Header */}
        <Box>
          <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
            <MUILink component={Link} href="/">
              Home
            </MUILink>
            <MUILink component={Link} href="/gallery">
              Gallery
            </MUILink>
            <Typography color="text.primary">My Booster Packs</Typography>
          </Breadcrumbs>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            justifyContent="space-between"
            gap={2}
          >
            <Box>
              <Typography variant="h3" component="h1" gutterBottom>
                My Custom Booster Packs
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Create and manage custom booster packs from your card collection
              </Typography>
            </Box>

            <Button
              component={Link}
              href="/gallery/create-pack"
              variant="contained"
              startIcon={<AddIcon />}
              size="large"
            >
              Create New Pack
            </Button>
          </Stack>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Packs Grid */}
        <Grid container spacing={3}>
          {loading ? (
            Array.from({ length: 6 }).map((_, idx) => (
              <Grid item xs={12} sm={6} md={4} key={idx}>
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
                    <Box sx={{ height: 100 }} />
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : packs.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'grey.50' }}>
                <PackIcon
                  sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}
                />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                  No custom booster packs yet
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Create your first custom booster pack from your card
                  collection
                </Typography>
                <Button
                  component={Link}
                  href="/gallery/create-pack"
                  variant="contained"
                  startIcon={<AddIcon />}
                >
                  Create Booster Pack
                </Button>
              </Paper>
            </Grid>
          ) : (
            packs.map(pack => (
              <Grid item xs={12} sm={6} md={4} key={pack.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* Pack Header */}
                  <Box
                    sx={{
                      background: pack.listing
                        ? 'linear-gradient(135deg, #4caf50 0%, #2e7d32 100%)'
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 140,
                      color: 'white',
                      position: 'relative',
                    }}
                  >
                    <PackIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      textAlign="center"
                      sx={{ mb: 0.5 }}
                    >
                      {pack.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ opacity: 0.9, textAlign: 'center' }}
                    >
                      {pack.packSize} cards per pack
                    </Typography>

                    {pack.listing && (
                      <Chip
                        label="Listed"
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          bgcolor: 'rgba(255, 255, 255, 0.2)',
                          color: 'white',
                        }}
                      />
                    )}
                  </Box>

                  {/* Pack Details */}
                  <CardContent sx={{ flex: 1, p: 3 }}>
                    <Stack spacing={2}>
                      {pack.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {pack.description}
                        </Typography>
                      )}

                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        <Chip
                          size="small"
                          label={`${pack.remainingPacks}/${pack.totalPacks} left`}
                          color={
                            pack.remainingPacks > 0 ? 'primary' : 'default'
                          }
                          variant="outlined"
                        />
                        <Chip
                          size="small"
                          label={pack.isActive ? 'Active' : 'Inactive'}
                          color={pack.isActive ? 'success' : 'default'}
                          variant="outlined"
                        />
                      </Stack>

                      {pack.listing && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            color="text.secondary"
                          >
                            Listed Price
                          </Typography>
                          <Typography
                            variant="h6"
                            color="success.main"
                            fontWeight={600}
                          >
                            ${parseFloat(pack.listing.priceUsd).toFixed(2)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pack.listing.packsAvailable} pack(s) available
                          </Typography>
                        </Box>
                      )}

                      <Typography variant="body2" color="text.secondary">
                        Created {new Date(pack.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  </CardContent>

                  {/* Actions */}
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1} width="100%">
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() =>
                            router.push(`/gallery/packs/${pack.id}`)
                          }
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>

                      {!pack.listing &&
                        pack.isActive &&
                        pack.remainingPacks > 0 && (
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<StoreIcon />}
                            onClick={() => openListingDialog(pack)}
                            sx={{ ml: 'auto' }}
                          >
                            List in Marketplace
                          </Button>
                        )}

                      {pack.listing && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<MoneyIcon />}
                          onClick={() =>
                            router.push(
                              `/marketplace/packs/${pack.listing!.id}`,
                            )
                          }
                          sx={{ ml: 'auto' }}
                        >
                          View Listing
                        </Button>
                      )}
                    </Stack>
                  </CardActions>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </Stack>

      {/* Listing Dialog */}
      <Dialog
        open={listingDialog.open}
        onClose={() => setListingDialog({ open: false, pack: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          List "{listingDialog.pack?.name}" in Marketplace
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ pt: 2 }}>
            <Alert severity="info">
              Create a marketplace listing for your custom booster pack. Users
              will be able to purchase and open packs immediately.
            </Alert>

            <TextField
              fullWidth
              label="Price (Credits)"
              type="number"
              value={listingForm.priceCredits}
              onChange={e =>
                setListingForm(prev => ({
                  ...prev,
                  priceCredits: Math.max(1, parseInt(e.target.value) || 1),
                }))
              }
              inputProps={{ min: 1 }}
              helperText="Price in platform credits"
            />

            <TextField
              fullWidth
              label="Price (USD)"
              type="number"
              value={listingForm.priceUsd}
              onChange={e =>
                setListingForm(prev => ({
                  ...prev,
                  priceUsd: Math.max(
                    0.01,
                    parseFloat(e.target.value) || 0.01,
                  ).toFixed(2),
                }))
              }
              inputProps={{ min: 0.01, step: 0.01 }}
              helperText="Price in US dollars"
              InputProps={{
                startAdornment: '$',
              }}
            />

            <TextField
              fullWidth
              label="Packs Available"
              type="number"
              value={listingForm.packsAvailable}
              onChange={e =>
                setListingForm(prev => ({
                  ...prev,
                  packsAvailable: Math.min(
                    listingDialog.pack?.remainingPacks || 1,
                    Math.max(1, parseInt(e.target.value) || 1),
                  ),
                }))
              }
              inputProps={{
                min: 1,
                max: listingDialog.pack?.remainingPacks,
              }}
              helperText={`Maximum: ${listingDialog.pack?.remainingPacks} (available packs)`}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setListingDialog({ open: false, pack: null })}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateListing}
            variant="contained"
            disabled={submitting}
            startIcon={
              submitting ? <CircularProgress size={20} /> : <StoreIcon />
            }
          >
            {submitting ? 'Creating...' : 'Create Listing'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

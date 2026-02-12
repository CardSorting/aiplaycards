'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  Link as MUILink,
  MenuItem,
  Pagination,
  Paper,
  Skeleton,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from '@mui/material';
import {
  CardData,
  CardDisplayWrapper,
  LazyCardRenderer,
  normalizeCardData,
  useCardLoadingState,
} from '@components/CardDisplayWrapper';

interface Listing extends CardData {
  // Marketplace-specific fields
  id: number; // listing ID
  priceCredits: number;
  priceUsd: string;
  sellerUserId: string;
  sellerUsername?: string;
  createdAt: string;
  status?: 'active' | 'sold' | 'canceled';
  soldAt?: string | null;
}

export default function ManageMarketplaceListingsPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const isMobile = useMediaQuery('(max-width:960px)');
  const isTablet = useMediaQuery('(max-width:1200px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'canceled'>(
    'active',
  );
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc'>('new');
  const [myListings, setMyListings] = useState<Listing[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    listing: Listing | null;
    busy: boolean;
  }>({ open: false, listing: null, busy: false });
  const [editId, setEditId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkDialog, setBulkDialog] = useState<{
    open: boolean;
    price: string;
    busy: boolean;
  }>({ open: false, price: '', busy: false });
  const [bulkCancelDialog, setBulkCancelDialog] = useState<{
    open: boolean;
    busy: boolean;
  }>({ open: false, busy: false });

  // Use the new card loading hook
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  useEffect(() => {
    let mounted = true;
    async function loadMine() {
      if (!user?.id) {
        setMyListings(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const params = new URLSearchParams({
          limit: '24',
          offset: String((page - 1) * 24),
          seller: user.id,
          status: activeTab,
        });
        if (search.trim()) params.set('search', search.trim());
        if (sort) params.set('sort', sort);
        const res = await fetch(`/api/marketplace?${params.toString()}`);
        const data = await res.json();
        if (mounted) {
          setTotal(Number(data?.total || 0));
          // Normalize the card data for consistent field naming
          const normalizedListings = Array.isArray(data?.data)
            ? data.data.map((listing: any) => ({
                ...normalizeCardData(listing),
                // Keep marketplace-specific fields
                id: listing.id,
                priceCredits: listing.priceCredits,
                priceUsd: listing.priceUsd,
                sellerUserId: listing.sellerUserId,
                sellerUsername: listing.sellerUsername,
                createdAt: listing.createdAt,
                status: listing.status,
                soldAt: listing.soldAt,
              }))
            : [];
          setMyListings(normalizedListings);
        }
      } catch {
        if (mounted) setMyListings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMine();
    const t = setInterval(loadMine, 20000);
    return () => {
      mounted = false;
      clearInterval(t);
    };
  }, [user?.id, activeTab, search, sort, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, sort]);

  // Clear selections and inline edit state on context changes
  useEffect(() => {
    setSelectedIds([]);
    setEditId(null);
    setEditPrice('');
  }, [activeTab, search, page]);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}
    >
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <MUILink component={Link} href="/">
          Home
        </MUILink>
        <MUILink component={Link} href="/marketplace">
          Marketplace
        </MUILink>
        <MUILink component={Link} href="/marketplace/manage">
          Manage
        </MUILink>
        <Typography color="text.primary">Listings</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={{ xs: 2, sm: 0 }}
        sx={{ mb: { xs: 2, md: 3 } }}
      >
        <Typography
          variant={isSmallMobile ? 'h5' : 'h4'}
          fontWeight={800}
          sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
        >
          Manage Listings
        </Typography>
        <Stack
          direction="row"
          spacing={1}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            component={Link}
            href="/marketplace/manage/create"
            variant="contained"
            size={isSmallMobile ? 'medium' : 'large'}
            sx={{ flex: { xs: 1, sm: 'none' } }}
          >
            {isSmallMobile ? 'Create' : 'Create New Listing'}
          </Button>
        </Stack>
      </Stack>

      {!user?.id && (
        <Card sx={{ mb: { xs: 2, md: 3 } }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              spacing={{ xs: 2, sm: 0 }}
            >
              <Typography sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Please sign in to manage your listings.
              </Typography>
              <Button
                component={Link}
                href="/signin"
                variant="contained"
                size={isSmallMobile ? 'medium' : 'large'}
                sx={{ flex: { xs: 1, sm: 'none' } }}
              >
                Sign In
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* Filters and Actions */}
      <Card sx={{ mb: { xs: 2, md: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, md: 3 }}>
            {/* Tabs Row */}
            <Box
              sx={{ borderBottom: { xs: 1, sm: 0 }, borderColor: 'divider' }}
            >
              <Tabs
                value={activeTab}
                onChange={(_, v) => setActiveTab(v)}
                variant={isMobile ? 'fullWidth' : 'standard'}
                sx={{
                  '& .MuiTab-root': {
                    fontSize: { xs: '0.875rem', sm: '0.875rem' },
                    minHeight: { xs: 40, sm: 48 },
                  },
                }}
              >
                <Tab value="active" label="Active" />
                <Tab value="sold" label="Sold" />
                <Tab value="canceled" label="Canceled" />
              </Tabs>
            </Box>

            {/* Search and Sort Row */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 2 }}
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <TextField
                size={isSmallMobile ? 'medium' : 'small'}
                placeholder="Search name"
                value={search}
                onChange={e => setSearch(e.target.value)}
                sx={{ flex: { xs: 1, sm: 'none' }, minWidth: { sm: 200 } }}
              />
              <TextField
                size={isSmallMobile ? 'medium' : 'small'}
                select
                label="Sort"
                value={sort}
                onChange={e => setSort(e.target.value as any)}
                sx={{
                  flex: { xs: 1, sm: 'none' },
                  minWidth: { xs: '100%', sm: 180 },
                }}
              >
                <MenuItem value="new">Newest</MenuItem>
                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                <MenuItem value="price_desc">Price: High to Low</MenuItem>
              </TextField>
            </Stack>

            {/* Bulk Actions Row */}
            {activeTab === 'active' && selectedIds.length > 0 && (
              <>
                {!isSmallMobile && <Divider />}
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={{ xs: 1, sm: 2 }}
                  alignItems={{ xs: 'stretch', sm: 'center' }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
                  >
                    {selectedIds.length} selected
                  </Typography>
                  <Button
                    disabled={selectedIds.length === 0}
                    onClick={() =>
                      setBulkDialog({ open: true, price: '', busy: false })
                    }
                    size={isSmallMobile ? 'medium' : 'small'}
                    variant="outlined"
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    {isSmallMobile ? 'Update Price' : 'Bulk Update Price'}
                  </Button>
                  <Button
                    color="error"
                    disabled={selectedIds.length === 0}
                    onClick={() =>
                      setBulkCancelDialog({ open: true, busy: false })
                    }
                    size={isSmallMobile ? 'medium' : 'small'}
                    variant="outlined"
                    sx={{ flex: { xs: 1, sm: 'none' } }}
                  >
                    {isSmallMobile ? 'Cancel' : 'Cancel Selected'}
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>

      <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
        {loading ? (
          Array.from({ length: 8 }).map((_, idx) => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={`sk-${idx}`}>
              <Card>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 1, sm: 2 },
                    backgroundColor: '#f8f9fa',
                    minHeight: { xs: 200, sm: 250, md: 280 },
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    sx={{
                      borderRadius: 1,
                      width: { xs: 120, sm: 160, md: 200 },
                      height: { xs: 160, sm: 220, md: 280 },
                    }}
                  />
                </Box>
                <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                  <Skeleton
                    width="60%"
                    sx={{ height: { xs: 20, sm: 24 }, mb: 1 }}
                  />
                  <Skeleton width="40%" sx={{ height: { xs: 16, sm: 20 } }} />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : myListings && myListings.length > 0 ? (
          myListings.map(l => (
            <Grid item xs={6} sm={6} md={4} lg={3} key={`mine-${l.id}`}>
              <LazyCardRenderer
                card={l}
                isLoaded={isCardLoaded(l.id)}
                onLoad={() => handleCardLoad(l.id)}
              >
                <Card sx={{ position: 'relative', height: '100%' }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedIds.includes(l.id)}
                        onChange={e => {
                          setSelectedIds(prev =>
                            e.target.checked
                              ? [...prev, l.id]
                              : prev.filter(id => id !== l.id),
                          );
                        }}
                        size={isSmallMobile ? 'medium' : 'small'}
                      />
                    }
                    label=""
                    sx={{
                      position: 'absolute',
                      top: { xs: 4, sm: 8 },
                      left: { xs: 4, sm: 8 },
                      zIndex: 1,
                      '& .MuiCheckbox-root': {
                        p: { xs: 0.5, sm: 1 },
                      },
                    }}
                  />

                  <Box
                    sx={{
                      p: { xs: 0.5, sm: 1 },
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: { xs: 200, sm: 250, md: 300 },
                      backgroundColor: '#f8f9fa',
                    }}
                  >
                    <CardDisplayWrapper
                      card={l}
                      width={isSmallMobile ? 'constrained' : 'responsive'}
                    />
                  </Box>

                  <CardContent
                    sx={{
                      p: { xs: 1, sm: 2 },
                      '&:last-child': { pb: { xs: 1, sm: 2 } },
                    }}
                  >
                    <Stack spacing={{ xs: 0.5, sm: 1 }}>
                      <Typography
                        variant={isSmallMobile ? 'subtitle2' : 'h6'}
                        sx={{
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          lineHeight: 1.2,
                        }}
                      >
                        {l.name}
                      </Typography>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.5, sm: 1 }}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        sx={{ flexWrap: 'wrap' }}
                      >
                        <Chip
                          size="small"
                          label={l.type}
                          sx={{
                            fontSize: { xs: '0.7rem', sm: '0.75rem' },
                            height: { xs: 24, sm: 32 },
                          }}
                        />
                        {editId === l.id ? (
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 0.5, sm: 1 }}
                            alignItems={{ xs: 'stretch', sm: 'center' }}
                            sx={{ width: { xs: '100%', sm: 'auto' } }}
                          >
                            <TextField
                              size="small"
                              type="number"
                              value={editPrice}
                              onChange={e => setEditPrice(e.target.value)}
                              sx={{ width: { xs: '100%', sm: 80 } }}
                            />
                            <Stack direction="row" spacing={0.5}>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={async () => {
                                  const next = parseFloat(editPrice);
                                  if (!Number.isFinite(next) || next <= 0)
                                    return;
                                  try {
                                    const res = await fetch(
                                      `/api/marketplace/${l.id}`,
                                      {
                                        method: 'POST',
                                        headers: {
                                          'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                          action: 'update_price',
                                          priceUsd: next,
                                        }),
                                      },
                                    );
                                    if (res.ok) {
                                      setMyListings(prev =>
                                        (prev || []).map(x =>
                                          x.id === l.id
                                            ? {
                                                ...x,
                                                priceUsd: next.toFixed(2),
                                              }
                                            : x,
                                        ),
                                      );
                                      setEditId(null);
                                      setEditPrice('');
                                    }
                                  } catch {}
                                }}
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="small"
                                onClick={() => {
                                  setEditId(null);
                                  setEditPrice('');
                                }}
                                sx={{
                                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                }}
                              >
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        ) : (
                          <Chip
                            size="small"
                            color="success"
                            label={`$${l.priceUsd}`}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                            }}
                          />
                        )}
                        {l.status && l.status !== 'active' && (
                          <Chip
                            size="small"
                            label={l.status}
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 32 },
                            }}
                          />
                        )}
                      </Stack>

                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 0.5, sm: 1 }}
                        sx={{ flexWrap: 'wrap', gap: { xs: 0.5, sm: 1 } }}
                      >
                        <Button
                          component={Link}
                          href={`/marketplace/${l.id}`}
                          variant="outlined"
                          size="small"
                          fullWidth={isSmallMobile}
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {isSmallMobile ? 'View' : 'View Public'}
                        </Button>
                        {activeTab === 'active' && (
                          <>
                            {editId === l.id ? null : (
                              <Button
                                variant="text"
                                size="small"
                                onClick={() => {
                                  setEditId(l.id);
                                  setEditPrice(String(l.priceUsd));
                                }}
                                fullWidth={isSmallMobile}
                                sx={{
                                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                                }}
                              >
                                Edit Price
                              </Button>
                            )}
                            <Button
                              variant="text"
                              size="small"
                              color="error"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  listing: l,
                                  busy: false,
                                })
                              }
                              fullWidth={isSmallMobile}
                              sx={{
                                fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              }}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </LazyCardRenderer>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Paper
              sx={{
                p: { xs: 3, sm: 4 },
                textAlign: 'center',
                mx: { xs: 0, sm: 2 },
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
              >
                {activeTab === 'active'
                  ? 'You have no active listings.'
                  : activeTab === 'sold'
                  ? 'No sold listings yet.'
                  : 'No canceled listings.'}
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>

      {!!total && (
        <Stack alignItems="center" sx={{ mt: { xs: 3, md: 4 } }}>
          <Pagination
            count={Math.ceil(total / 24)}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
            size={isSmallMobile ? 'medium' : 'large'}
            showFirstButton={!isSmallMobile}
            showLastButton={!isSmallMobile}
            siblingCount={isSmallMobile ? 0 : 1}
            boundaryCount={1}
          />
        </Stack>
      )}

      {/* Cancel Listing Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() =>
          !confirmDialog.busy &&
          setConfirmDialog({ open: false, listing: null, busy: false })
        }
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Cancel Listing
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="body2"
            sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
          >
            Cancel listing for {confirmDialog.listing?.name}? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() =>
              setConfirmDialog({ open: false, listing: null, busy: false })
            }
            disabled={confirmDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              if (!confirmDialog.listing) return;
              setConfirmDialog(prev => ({ ...prev, busy: true }));
              try {
                const res = await fetch(
                  `/api/marketplace/${confirmDialog.listing.id}`,
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel' }),
                  },
                );
                if (res.ok) {
                  setMyListings(prev =>
                    (prev || []).filter(
                      x => x.id !== confirmDialog.listing!.id,
                    ),
                  );
                  setConfirmDialog({ open: false, listing: null, busy: false });
                } else {
                  const d = await res.json().catch(() => ({}));
                  alert(d?.error || 'Cancel failed');
                  setConfirmDialog(prev => ({ ...prev, busy: false }));
                }
              } catch {
                setConfirmDialog(prev => ({ ...prev, busy: false }));
              }
            }}
            disabled={confirmDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            {confirmDialog.busy ? 'Canceling…' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Update Price Dialog */}
      <Dialog
        open={bulkDialog.open}
        onClose={() =>
          !bulkDialog.busy &&
          setBulkDialog({ open: false, price: '', busy: false })
        }
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Bulk Update Price
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="body2"
            sx={{
              mb: { xs: 2, sm: 3 },
              fontSize: { xs: '0.9rem', sm: '0.875rem' },
            }}
          >
            Update price for {selectedIds.length} selected listing(s).
          </Typography>
          <TextField
            autoFocus={!isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
            label="New Price"
            type="number"
            value={bulkDialog.price}
            onChange={e =>
              setBulkDialog(prev => ({ ...prev, price: e.target.value }))
            }
            fullWidth
            sx={{ mt: { xs: 1, sm: 0 } }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() =>
              setBulkDialog({ open: false, price: '', busy: false })
            }
            disabled={bulkDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={async () => {
              const next = parseFloat(bulkDialog.price);
              if (!Number.isFinite(next) || next <= 0) return;
              setBulkDialog(prev => ({ ...prev, busy: true }));
              try {
                for (const id of selectedIds) {
                  await fetch(`/api/marketplace/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      action: 'update_price',
                      priceUsd: next,
                    }),
                  });
                }
                setMyListings(prev =>
                  (prev || []).map(x =>
                    selectedIds.includes(x.id)
                      ? { ...x, priceUsd: next.toFixed(2) }
                      : x,
                  ),
                );
                setBulkDialog({ open: false, price: '', busy: false });
              } catch {
                setBulkDialog(prev => ({ ...prev, busy: false }));
              }
            }}
            disabled={bulkDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            {bulkDialog.busy ? 'Updating…' : 'Apply'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Cancel Dialog */}
      <Dialog
        open={bulkCancelDialog.open}
        onClose={() =>
          !bulkCancelDialog.busy &&
          setBulkCancelDialog({ open: false, busy: false })
        }
        fullScreen={isMobile}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            margin: { xs: 0, sm: 2 },
            maxHeight: { xs: '100vh', sm: 'calc(100vh - 64px)' },
          },
        }}
      >
        <DialogTitle
          sx={{
            pb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
          }}
        >
          Cancel Selected Listings
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography
            variant="body2"
            sx={{ fontSize: { xs: '0.9rem', sm: '0.875rem' } }}
          >
            Cancel {selectedIds.length} selected listing(s)? This cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: { xs: 2, sm: 1 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 0 },
          }}
        >
          <Button
            onClick={() => setBulkCancelDialog({ open: false, busy: false })}
            disabled={bulkCancelDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
          >
            Close
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              setBulkCancelDialog(prev => ({ ...prev, busy: true }));
              try {
                for (const id of selectedIds) {
                  await fetch(`/api/marketplace/${id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'cancel' }),
                  });
                }
                setMyListings(prev =>
                  (prev || []).filter(x => !selectedIds.includes(x.id)),
                );
                setSelectedIds([]);
                setBulkCancelDialog({ open: false, busy: false });
              } catch {
                setBulkCancelDialog(prev => ({ ...prev, busy: false }));
              }
            }}
            disabled={bulkCancelDialog.busy}
            fullWidth={isMobile}
            size={isSmallMobile ? 'medium' : 'small'}
            sx={{ ml: { xs: 0, sm: 1 } }}
          >
            {bulkCancelDialog.busy ? 'Canceling…' : 'Confirm Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

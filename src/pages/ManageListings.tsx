import React, { FC, useCallback, useEffect, useState } from 'react';
import {
    Alert,
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
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import {
    CardDisplayWrapper,
    LazyCardRenderer,
    normalizeCardData,
    useCardLoadingState,
} from '@/components/CardDisplayWrapper';

const ManageListingsPage: FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const user = session?.user;
    const isMobile = useMediaQuery('(max-width:960px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    const [activeTab, setActiveTab] = useState<'active' | 'sold' | 'canceled'>(
        'active',
    );
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<'new' | 'price_asc' | 'price_desc'>('new');
    const [myListings, setMyListings] = useState<any[] | null>(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        listing: any | null;
        busy: boolean;
    }>({ open: false, listing: null, busy: false });
    const [editId, setEditId] = useState<number | null>(null);
    const [editPrice, setEditPrice] = useState<string>('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

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
                    const normalizedListings = Array.isArray(data?.data)
                        ? data.data.map((listing: any) => ({
                            ...normalizeCardData(listing),
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
        return () => { mounted = false; };
    }, [user?.id, activeTab, search, sort, page]);

    useEffect(() => { setPage(1); }, [activeTab, search, sort]);

    const handleCancelListing = async () => {
        if (!confirmDialog.listing) return;
        setConfirmDialog(prev => ({ ...prev, busy: true }));
        try {
            const res = await fetch(`/api/marketplace/${confirmDialog.listing.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'cancel' }),
            });
            if (res.ok) {
                setMyListings(prev => (prev || []).filter(x => x.id !== confirmDialog.listing!.id));
                setConfirmDialog({ open: false, listing: null, busy: false });
            }
        } catch { } finally {
            setConfirmDialog(prev => ({ ...prev, busy: false }));
        }
    };

    if (!user) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <SEO title="Manage Listings" description="Sign in to manage your marketplace listings." />
                <Alert severity="info" sx={{ mb: 4 }}>Please sign in to manage your listings.</Alert>
                <Button component={Link} to="/signin" variant="contained">Sign In</Button>
            </Container>
        );
    }

    return (
        <>
            <SEO title="Manage Listings | PlayMore TCG" description="View and manage your active, sold, and canceled marketplace listings." />
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
                    <MUILink component={Link} to="/">Home</MUILink>
                    <MUILink component={Link} to="/marketplace">Marketplace</MUILink>
                    <Typography color="text.primary">Manage Listings</Typography>
                </Breadcrumbs>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h4" fontWeight={800}>Manage Listings</Typography>
                    <Button component={Link} to="/marketplace/manage/create" variant="contained">Create New Listing</Button>
                </Stack>

                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
                            <Tab value="active" label="Active" />
                            <Tab value="sold" label="Sold" />
                            <Tab value="canceled" label="Canceled" />
                        </Tabs>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                size="small"
                                placeholder="Search name"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <TextField
                                size="small"
                                select
                                value={sort}
                                onChange={e => setSort(e.target.value as any)}
                                sx={{ minWidth: 150 }}
                            >
                                <MenuItem value="new">Newest</MenuItem>
                                <MenuItem value="price_asc">Price: Low to High</MenuItem>
                                <MenuItem value="price_desc">Price: High to Low</MenuItem>
                            </TextField>
                        </Stack>
                    </CardContent>
                </Card>

                <Grid container spacing={3}>
                    {loading ? (
                        Array.from({ length: 8 }).map((_, i) => (
                            <Grid item xs={6} sm={4} md={3} key={i}><Skeleton variant="rectangular" height={300} /></Grid>
                        ))
                    ) : myListings?.length ? (
                        myListings.map(l => (
                            <Grid item xs={6} sm={4} md={3} key={l.id}>
                                <LazyCardRenderer card={l} isLoaded={isCardLoaded(l.id)} onLoad={() => handleCardLoad(l.id)}>
                                    <Card sx={{ height: '100%', position: 'relative' }}>
                                        <Box sx={{ p: 1, backgroundColor: '#f8f9fa', minHeight: 250, display: 'flex', justifyContent: 'center' }}>
                                            <CardDisplayWrapper card={l} width="responsive" />
                                        </Box>
                                        <CardContent>
                                            <Typography variant="subtitle2" noWrap>{l.name}</Typography>
                                            <Typography variant="body2" color="success.main" fontWeight={700}>
                                                ${l.priceUsd}
                                            </Typography>
                                            <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                                <Button size="small" variant="outlined" component={Link} to={`/marketplace/${l.id}`}>View</Button>
                                                {activeTab === 'active' && (
                                                    <Button size="small" color="error" onClick={() => setConfirmDialog({ open: true, listing: l, busy: false })}>Cancel</Button>
                                                )}
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </LazyCardRenderer>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}><Typography align="center" color="text.secondary">No listings found.</Typography></Grid>
                    )}
                </Grid>

                {total > 24 && (
                    <Stack alignItems="center" sx={{ mt: 4 }}>
                        <Pagination count={Math.ceil(total / 24)} page={page} onChange={(_, p) => setPage(p)} color="primary" />
                    </Stack>
                )}
            </Container>

            <Dialog open={confirmDialog.open} onClose={() => !confirmDialog.busy && setConfirmDialog({ open: false, listing: null, busy: false })}>
                <DialogTitle>Cancel Listing</DialogTitle>
                <DialogContent>Are you sure you want to cancel the listing for {confirmDialog.listing?.name}?</DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, listing: null, busy: false })}>Close</Button>
                    <Button variant="contained" color="error" onClick={handleCancelListing} disabled={confirmDialog.busy}>
                        {confirmDialog.busy ? 'Canceling...' : 'Confirm Cancel'}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default ManageListingsPage;

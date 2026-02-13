import React, { FC, useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    Link as MUILink,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    AccountBalanceWallet as CreditIcon,
    LocalShipping as LocalShippingIcon,
    Security as SecurityIcon,
    ShoppingCart as ShoppingCartIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import Routes from '@/routes';

interface MarketplaceListing {
    id: number;
    name: string;
    priceCredits: number;
    type: string;
    rarity: string;
    supertype?: string;
    subtype?: string;
    hitpoints?: number;
    illustrator?: string;
    cardId: number;
    sellerUsername?: string;
    sellerUserId?: string;
    imageData?: {
        dataUrl?: string;
        generated?: string[];
        thumbs?: string[];
    };
    primaryImage?: string;
    createdAt: string;
    cardEditorState?: {
        cardNumber?: string;
        totalInSet?: string;
    };
}

interface SellerProfile {
    userId: string;
    username?: string;
    avatarUrl?: string;
}

const MarketplaceCheckoutPage: FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { data: session } = useSession();
    const listingId = params?.listingId;

    const [listing, setListing] = useState<MarketplaceListing | null>(null);
    const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(
        null,
    );
    const [userCredits, setUserCredits] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [purchasing, setPurchasing] = useState(false);

    // Load listing data
    useEffect(() => {
        const loadListing = async () => {
            if (!listingId) return;

            setLoading(true);
            try {
                const response = await fetch(`/api/marketplace/${listingId}`);

                if (!response.ok) {
                    throw new Error(
                        response.status === 404
                            ? 'Listing not found'
                            : 'Failed to load listing',
                    );
                }

                const data = await response.json();
                if (data?.data) {
                    setListing(data.data);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load listing');
            } finally {
                setLoading(false);
            }
        };

        loadListing();
    }, [listingId]);

    // Load seller profile
    useEffect(() => {
        const loadSeller = async () => {
            if (!listing) return;

            const handle = listing.sellerUsername || String(listing.sellerUserId);
            if (!handle) return;

            try {
                const response = await fetch(
                    `/api/users/profile/${encodeURIComponent(handle)}`,
                );
                if (!response.ok) return;

                const data = await response.json();
                setSellerProfile({
                    userId: data?.data?.userId,
                    username: data?.data?.username,
                    avatarUrl: data?.data?.avatarUrl || undefined,
                });
            } catch (err) {
                console.error('Failed to load seller profile:', err);
            }
        };

        loadSeller();
    }, [listing]);

    // Load user credits
    useEffect(() => {
        const loadUserCredits = async () => {
            if (!session?.user?.id) return;

            try {
                const response = await fetch(
                    `/api/users/profile/${encodeURIComponent(session.user.id)}`,
                );
                if (!response.ok) return;

                const data = await response.json();
                setUserCredits(data?.data?.credits || 0);
            } catch (err) {
                console.error('Failed to load user credits:', err);
            }
        };

        loadUserCredits();
    }, [session]);

    const handlePurchaseSuccess = useCallback(() => {
        navigate('/marketplace?purchase=success');
    }, [navigate]);

    const handlePurchaseError = useCallback((err: any) => {
        console.error('Purchase error:', err);
        setError('Purchase failed. Please try again.');
        setPurchasing(false);
    }, []);

    const handleCreditPurchase = useCallback(async () => {
        if (!listing) return;

        setPurchasing(true);
        setError(null);

        try {
            const response = await fetch(`/api/marketplace/${listing.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'buy' }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Purchase failed');
            }

            handlePurchaseSuccess();
        } catch (err) {
            handlePurchaseError(err);
        }
    }, [listing, handlePurchaseSuccess, handlePurchaseError]);

    const priceCredits = listing?.priceCredits || 0;
    const hasEnoughCredits = userCredits >= priceCredits;
    const sellerUsername =
        sellerProfile?.username || listing?.sellerUsername || null;
    const sellerUserId =
        sellerProfile?.userId || String(listing?.sellerUserId || '') || null;
    const sellerDisplay = sellerUsername
        ? `@${sellerUsername}`
        : sellerUserId
            ? `User ${String(sellerUserId).slice(0, 8)}`
            : '';
    const sellerAvatarLetter = (
        sellerUsername?.[0] ||
        String(sellerUserId)?.[0] ||
        '?'
    ).toUpperCase();

    if (!session) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <SEO title="Checkout" description="Please sign in to purchase cards." />
                <Alert severity="info" sx={{ mb: 4 }}>
                    Please sign in to purchase from the marketplace
                </Alert>
                <Button component={Link} to="/signin" variant="contained">
                    Sign In
                </Button>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={48} />
                <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                    Loading listing information...
                </Typography>
            </Container>
        );
    }

    if (error || !listing) {
        return (
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 4 }}>
                    {error || 'Listing not found'}
                </Alert>
                <Button
                    component={Link}
                    to="/marketplace"
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                >
                    Back to Marketplace
                </Button>
            </Container>
        );
    }

    return (
        <>
            <SEO
                title={`Checkout - ${listing.name} | PlayMore TCG Marketplace`}
                description={`Complete your purchase of ${listing.name} for ${priceCredits} credits. Secure checkout with your credit balance.`}
            />

            <Container maxWidth="md" sx={{ py: 4 }}>
                <Stack spacing={4}>
                    {/* Header */}
                    <Box>
                        <Button
                            component={Link}
                            to={`/marketplace/${listingId}`}
                            variant="text"
                            startIcon={<ArrowBackIcon />}
                            sx={{ mb: 2 }}
                        >
                            Back to Listing
                        </Button>

                        <Typography variant="h3" fontWeight={800} gutterBottom>
                            Complete Purchase
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            Review your order and complete purchase using your credit balance
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {/* Product Details */}
                        <Grid item xs={12} md={5}>
                            <Paper sx={{ p: 3, borderRadius: 3 }}>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    gutterBottom
                                    sx={{ mb: 2 }}
                                >
                                    Product Details
                                </Typography>

                                <Box sx={{ mb: 3, textAlign: 'center' }}>
                                    {listing.imageData?.dataUrl || listing.primaryImage ? (
                                        <img
                                            src={
                                                listing.imageData?.dataUrl || listing.primaryImage || ''
                                            }
                                            alt={listing.name}
                                            style={{
                                                width: '100%',
                                                maxWidth: 200,
                                                height: 'auto',
                                                borderRadius: '8px',
                                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                            }}
                                        />
                                    ) : (
                                        <Box
                                            sx={{
                                                width: '100%',
                                                maxWidth: 200,
                                                aspectRatio: '63/88',
                                                backgroundColor: '#f0f0f0',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                Card Preview
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                <Typography variant="h6" fontWeight={600} gutterBottom>
                                    {listing.name}
                                </Typography>

                                <Stack
                                    direction="row"
                                    spacing={1}
                                    flexWrap="wrap"
                                    sx={{ mb: 2 }}
                                >
                                    <Chip size="small" label={listing.type} />
                                    {listing.rarity && (
                                        <Chip size="small" color="warning" label={listing.rarity} />
                                    )}
                                    {listing.supertype && (
                                        <Chip size="small" label={listing.supertype} />
                                    )}
                                    {listing.subtype && (
                                        <Chip
                                            size="small"
                                            variant="outlined"
                                            label={listing.subtype}
                                        />
                                    )}
                                    {typeof listing.hitpoints === 'number' && (
                                        <Chip
                                            size="small"
                                            color="info"
                                            label={`${listing.hitpoints} HP`}
                                        />
                                    )}
                                </Stack>

                                {listing.illustrator && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mb: 2 }}
                                    >
                                        Illustrated by {listing.illustrator}
                                    </Typography>
                                )}

                                {listing.cardEditorState?.cardNumber &&
                                    listing.cardEditorState?.totalInSet && (
                                        <Typography variant="body2" color="text.secondary">
                                            #{listing.cardEditorState.cardNumber} of{' '}
                                            {listing.cardEditorState.totalInSet}
                                        </Typography>
                                    )}

                                <Divider sx={{ my: 2 }} />

                                {/* Seller Info */}
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    Seller Information
                                </Typography>
                                <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                    sx={{ mb: 1 }}
                                >
                                    <Avatar
                                        src={sellerProfile?.avatarUrl || undefined}
                                        sx={{ width: 32, height: 32, fontSize: 14 }}
                                    >
                                        {sellerAvatarLetter}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {sellerDisplay}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                            <VerifiedIcon color="success" sx={{ fontSize: 14 }} />
                                            <Typography variant="caption" color="text.secondary">
                                                Verified Seller
                                            </Typography>
                                        </Stack>
                                    </Box>
                                </Stack>

                                {(sellerUsername || sellerUserId) && (
                                    <MUILink
                                        component={Link}
                                        to={`/u/${encodeURIComponent(
                                            sellerUsername || sellerUserId || '',
                                        )}`}
                                        underline="hover"
                                        sx={{ fontSize: '0.875rem' }}
                                    >
                                        View seller profile
                                    </MUILink>
                                )}
                            </Paper>
                        </Grid>

                        {/* Checkout */}
                        <Grid item xs={12} md={7}>
                            <Paper sx={{ p: 4, borderRadius: 3 }}>
                                <Stack spacing={4}>
                                    {error && (
                                        <Alert severity="error" onClose={() => setError(null)}>
                                            {error}
                                        </Alert>
                                    )}

                                    {/* Order Summary */}
                                    <Box>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                            sx={{ mb: 2 }}
                                        >
                                            <ShoppingCartIcon color="primary" />
                                            <Typography variant="h6" fontWeight={600}>
                                                Order Summary
                                            </Typography>
                                        </Stack>

                                        <Paper
                                            sx={{
                                                p: 3,
                                                bgcolor: 'background.default',
                                                borderRadius: 2,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography>Card Price</Typography>
                                                <Typography fontWeight={600}>
                                                    {priceCredits} credits
                                                </Typography>
                                            </Box>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    mb: 1,
                                                }}
                                            >
                                                <Typography>Transaction Fee</Typography>
                                                <Typography fontWeight={600}>0 credits</Typography>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                }}
                                            >
                                                <Typography variant="h6" fontWeight={700}>
                                                    Total
                                                </Typography>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                    color="primary"
                                                >
                                                    {priceCredits} credits
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ my: 2 }} />
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography variant="body2" color="text.secondary">
                                                    Your Balance
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={
                                                        hasEnoughCredits ? 'success.main' : 'error.main'
                                                    }
                                                >
                                                    {userCredits} credits
                                                </Typography>
                                            </Box>
                                        </Paper>
                                    </Box>

                                    {/* Delivery Information */}
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight={600}
                                            gutterBottom
                                            sx={{ mb: 2 }}
                                        >
                                            Delivery Information
                                        </Typography>
                                        <Stack spacing={2}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocalShippingIcon color="success" />
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600}>
                                                        Instant Digital Delivery
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Card will be delivered to your collection
                                                        immediately after payment
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </Stack>
                                    </Box>

                                    {/* Credit Balance Notice */}
                                    <Paper
                                        sx={{
                                            p: 2,
                                            bgcolor: hasEnoughCredits
                                                ? 'success.light'
                                                : 'warning.light',
                                            borderRadius: 2,
                                        }}
                                    >
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <CreditIcon
                                                color={hasEnoughCredits ? 'success' : 'warning'}
                                            />
                                            <Box>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={600}
                                                    color={
                                                        hasEnoughCredits ? 'success.dark' : 'warning.dark'
                                                    }
                                                >
                                                    {hasEnoughCredits
                                                        ? 'Sufficient Credit Balance'
                                                        : 'Insufficient Credits'}
                                                </Typography>
                                                <Typography
                                                    variant="caption"
                                                    color={
                                                        hasEnoughCredits ? 'success.dark' : 'warning.dark'
                                                    }
                                                >
                                                    {hasEnoughCredits
                                                        ? 'You have enough credits to complete this purchase.'
                                                        : `You need ${priceCredits - userCredits
                                                        } more credits to purchase this card.`}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>

                                    {/* Purchase Button */}
                                    <Box sx={{ pt: 2 }}>
                                        {hasEnoughCredits ? (
                                            <Button
                                                variant="contained"
                                                size="large"
                                                fullWidth
                                                onClick={handleCreditPurchase}
                                                disabled={purchasing}
                                                startIcon={
                                                    purchasing ? (
                                                        <CircularProgress size={20} />
                                                    ) : (
                                                        <CreditIcon />
                                                    )
                                                }
                                                sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                                            >
                                                {purchasing
                                                    ? 'Processing Purchase...'
                                                    : `Purchase for ${priceCredits} Credits`}
                                            </Button>
                                        ) : (
                                            <Stack spacing={2}>
                                                <Button
                                                    variant="contained"
                                                    size="large"
                                                    fullWidth
                                                    disabled
                                                    sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                                                >
                                                    Insufficient Credits
                                                </Button>
                                                <Button
                                                    component={Link}
                                                    to="/credits"
                                                    variant="outlined"
                                                    size="large"
                                                    fullWidth
                                                    startIcon={<CreditIcon />}
                                                >
                                                    Buy More Credits
                                                </Button>
                                            </Stack>
                                        )}

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ mt: 1, display: 'block', textAlign: 'center' }}
                                        >
                                            By completing this purchase, you agree to our Terms of
                                            Service and Privacy Policy
                                        </Typography>
                                    </Box>

                                    {/* Purchase Protection */}
                                    <Box sx={{ mt: 2 }}>
                                        <Typography
                                            variant="subtitle2"
                                            fontWeight={600}
                                            gutterBottom
                                        >
                                            Purchase Protection
                                        </Typography>
                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <SecurityIcon color="action" sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Secure credit-based transaction processing
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <VerifiedIcon color="action" sx={{ fontSize: 16 }} />
                                                <Typography variant="caption" color="text.secondary">
                                                    Verified seller and authentic digital card
                                                </Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <LocalShippingIcon
                                                    color="action"
                                                    sx={{ fontSize: 16 }}
                                                />
                                                <Typography variant="caption" color="text.secondary">
                                                    Instant delivery to your account
                                                </Typography>
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Paper>
                        </Grid>
                    </Grid>
                </Stack>
            </Container>
        </>
    );
};

export default MarketplaceCheckoutPage;

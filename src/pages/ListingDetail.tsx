import React, { FC, useCallback, useEffect, useState } from 'react';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Avatar,
    Box,
    Breadcrumbs,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Link as MUILink,
    Skeleton,
    Stack,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import {
    LocalShipping as LocalShippingIcon,
    Bolt as BoltIcon,
    Lock as LockIcon,
    Share as ShareIcon,
    Close as CloseIcon,
    Favorite as FavoriteIcon,
    FavoriteBorder as FavoriteBorderIcon,
    ExpandMore as ExpandMoreIcon,
    Verified as VerifiedIcon,
} from '@mui/icons-material';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import Routes from '@/routes';
import {
    CardDisplayWrapper,
    MTGCardDisplayWrapper,
    YugiohCardDisplayWrapper,
    normalizeCardData,
    useCardLoadingState,
} from '@/components/CardDisplayWrapper';

const ListingDetailPage: FC = () => {
    const navigate = useNavigate();
    const params = useParams();
    const { data: session } = useSession();
    const authUser = session?.user;
    const id = params?.id;

    const [listing, setListing] = useState<any | null>(null);
    const [card, setCard] = useState<any | null>(null);
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
    const isMdUp = useMediaQuery('(min-width:900px)');
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [sellerProfile, setSellerProfile] = useState<{
        userId: string;
        username?: string;
        avatarUrl?: string;
    } | null>(null);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [likesBusy, setLikesBusy] = useState<boolean>(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [relatedListings, setRelatedListings] = useState<any[]>([]);
    const [faqExpanded, setFaqExpanded] = useState<string | false>(false);

    const { handleCardLoad, isCardLoaded } = useCardLoadingState();

    const getCardWrapper = (card: any) => {
        if (!card) return CardDisplayWrapper;
        if (
            card.category === 'mtg' ||
            (card.type &&
                [
                    'Artifact',
                    'Creature',
                    'Enchantment',
                    'Instant',
                    'Land',
                    'Planeswalker',
                    'Sorcery',
                    'Tribal',
                ].includes(card.type))
        ) {
            return MTGCardDisplayWrapper;
        }
        if (card.category === 'yugioh' || card.cardEditorState?.cardType) {
            return YugiohCardDisplayWrapper;
        }
        return CardDisplayWrapper;
    };

    useEffect(() => {
        let active = true;
        async function load() {
            if (!id) return;
            setLoading(true);
            try {
                const res = await fetch(`/api/marketplace/${id}`);
                if (!res.ok) throw new Error('Listing not found');
                const data = await res.json();
                if (active) {
                    const normalizedListing = data?.data
                        ? normalizeCardData(data.data)
                        : null;
                    setListing(normalizedListing);
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load listing');
            } finally {
                if (active) setLoading(false);
            }
        }
        load();
        return () => { active = false; };
    }, [id]);

    useEffect(() => {
        let active = true;
        async function loadCard() {
            if (!listing?.cardId) return;
            try {
                const res = await fetch(`/api/cards/${listing.cardId}`);
                const data = await res.json();
                if (active) setCard(data?.data || null);
            } catch { }
        }
        loadCard();
        return () => { active = false; };
    }, [listing?.cardId]);

    useEffect(() => {
        let active = true;
        async function loadSeller() {
            const handle = listing?.sellerUsername || listing?.sellerUserId;
            if (!handle) return;
            try {
                const res = await fetch(
                    `/api/users/profile/${encodeURIComponent(handle)}`,
                );
                if (!res.ok) return;
                const data = await res.json();
                if (!active) return;
                setSellerProfile({
                    userId: data?.data?.userId,
                    username: data?.data?.username,
                    avatarUrl: data?.data?.avatarUrl || undefined,
                });
            } catch { }
        }
        loadSeller();
        return () => { active = false; };
    }, [listing]);

    useEffect(() => {
        let active = true;
        async function loadLikes() {
            const cardId = listing?.cardId;
            if (!cardId) return;
            try {
                const res = await fetch(`/api/cards/${cardId}/likes`);
                const data = await res.json();
                if (!active) return;
                setLikesCount(Number(data?.data?.count || 0));
                setIsLiked(Boolean(data?.data?.isLiked));
            } catch { }
        }
        loadLikes();
        return () => { active = false; };
    }, [listing?.cardId]);

    useEffect(() => {
        let active = true;
        async function loadRelated() {
            if (!listing?.cardId || !listing?.id) return;
            try {
                const res = await fetch(
                    `/api/marketplace?cardType=${listing.type}&limit=4&exclude=${listing.id}`,
                );
                const data = await res.json();
                if (active && data?.data) {
                    setRelatedListings(data.data.slice(0, 4));
                }
            } catch { }
        }
        loadRelated();
        return () => { active = false; };
    }, [listing]);

    const toggleLike = async () => {
        if (!listing?.cardId) return;
        if (!authUser) {
            navigate('/signin');
            return;
        }
        if (likesBusy) return;
        setLikesBusy(true);
        try {
            const res = await fetch(`/api/cards/${listing.cardId}/likes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: isLiked ? 'unlike' : 'like' }),
            });
            const data = await res.json();
            if (res.ok) {
                setLikesCount(Number(data?.data?.count || 0));
                setIsLiked(Boolean(data?.data?.isLiked));
            }
        } finally {
            setLikesBusy(false);
        }
    };

    const handleBuyNow = useCallback(() => {
        if (!authUser) {
            navigate('/signin');
            return;
        }
        if (listing?.id) {
            navigate(`/checkout/marketplace/${listing.id}`);
        }
    }, [authUser, listing, navigate]);

    const sellerUsername =
        sellerProfile?.username || listing?.sellerUsername || null;
    const sellerUserId = sellerProfile?.userId || listing?.sellerUserId || null;
    const sellerDisplay = sellerUsername
        ? `@${sellerUsername}`
        : sellerUserId
            ? `User ${String(sellerUserId).slice(0, 8)}`
            : '';
    const sellerAvatarLetter = (
        sellerUsername?.[0] ||
        sellerUserId?.[0] ||
        '?'
    ).toUpperCase();
    const sellerLinkHandle = sellerUsername || sellerUserId || '';

    const generateDescription = () => {
        if (!listing) return 'Custom trading card on PlayMore TCG.';
        const price = (listing.priceCredits / 100).toFixed(2);
        return `Buy ${listing.name} - a custom ${listing.type} card for $${price} on PlayMore TCG. Secure checkout and instant digital delivery.`;
    };

    if (loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={48} />
                <Typography sx={{ mt: 2 }} color="text.secondary">Loading listing...</Typography>
            </Container>
        );
    }

    if (error || !listing) {
        return (
            <Container maxWidth="lg" sx={{ py: 8 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error || 'Listing not found'}</Alert>
                <Button component={Link} to="/marketplace" variant="outlined">Back to Marketplace</Button>
            </Container>
        );
    }

    return (
        <>
            <SEO
                title={`${listing.name} - Marketplace | PlayMore TCG`}
                description={generateDescription()}
                image={listing.imageData?.dataUrl || listing.primaryImage}
            />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Stack spacing={1} sx={{ mb: 2 }}>
                    <Breadcrumbs aria-label="breadcrumb">
                        <MUILink component={Link} to="/">Home</MUILink>
                        <MUILink component={Link} to="/marketplace">Marketplace</MUILink>
                        <Typography color="text.primary">{listing.name}</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800}>Product Details</Typography>
                </Stack>

                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Card>
                            <Box
                                sx={{
                                    p: 2,
                                    backgroundColor: '#f8f9fa',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    cursor: 'zoom-in',
                                }}
                                onClick={() => setImageDialogOpen(true)}
                            >
                                {(() => {
                                    const CardWrapper = getCardWrapper(listing);
                                    return (
                                        <CardWrapper
                                            card={listing}
                                            width="constrained"
                                            fallbackContent={<Skeleton variant="rectangular" width="100%" height={420} />}
                                        />
                                    );
                                })()}
                            </Box>
                        </Card>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Stack spacing={2} sx={{ position: isMdUp ? 'sticky' : 'static', top: 84 }}>
                            <Typography variant="h5" fontWeight={700}>{listing.name}</Typography>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <Chip size="small" label={listing.type} />
                                <Chip
                                    size="small"
                                    color="success"
                                    label={`$${(listing.priceCredits / 100).toFixed(2)}`}
                                />
                                <Tooltip title="Share">
                                    <IconButton size="small" onClick={() => navigator?.clipboard?.writeText(window.location.href)}>
                                        <ShareIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                                    <IconButton
                                        size="small"
                                        color={isLiked ? 'error' : 'default'}
                                        onClick={toggleLike}
                                        disabled={likesBusy}
                                    >
                                        {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                    </IconButton>
                                </Tooltip>
                                <Typography variant="caption" color="text.secondary">{likesCount}</Typography>
                            </Stack>

                            {sellerDisplay && (
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Avatar src={sellerProfile?.avatarUrl || undefined} sx={{ width: 32, height: 32 }}>
                                        {sellerAvatarLetter}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700}>{sellerDisplay}</Typography>
                                    <MUILink component={Link} to={`/u/${encodeURIComponent(sellerLinkHandle)}`} underline="hover" sx={{ fontSize: 13 }}>
                                        View profile
                                    </MUILink>
                                </Stack>
                            )}

                            <Divider />
                            <Typography variant="h4" fontWeight={800}>
                                ${(listing.priceCredits / 100).toFixed(2)}
                            </Typography>
                            <Button size="large" variant="contained" onClick={handleBuyNow} startIcon={<BoltIcon />}>
                                Buy Now
                            </Button>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LockIcon color="action" fontSize="small" />
                                <Typography variant="caption">Secure credit-based checkout</Typography>
                            </Stack>
                            <Stack direction="row" spacing={1} alignItems="center">
                                <LocalShippingIcon color="action" fontSize="small" />
                                <Typography variant="caption">Instant digital delivery</Typography>
                            </Stack>

                            <Divider />
                            <Typography variant="subtitle2" fontWeight={700}>Card Details</Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                {listing.supertype && <Chip size="small" label={listing.supertype} />}
                                {listing.subtype && <Chip size="small" variant="outlined" label={listing.subtype} />}
                                {listing.rarity && <Chip size="small" color="warning" label={listing.rarity} />}
                            </Stack>
                        </Stack>
                    </Grid>
                </Grid>

                <Box sx={{ mt: 6 }}>
                    <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>FAQ</Typography>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography fontWeight={600}>How do I buy this card?</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2">
                                Click 'Buy Now' and pay with your credit balance. The card will be instantly added to your collection.
                            </Typography>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Container>

            <Dialog open={imageDialogOpen} onClose={() => setImageDialogOpen(false)} maxWidth="lg">
                <DialogTitle>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {listing.name}
                        <IconButton onClick={() => setImageDialogOpen(false)}><CloseIcon /></IconButton>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        {(() => {
                            const CardWrapper = getCardWrapper(listing);
                            return <CardWrapper card={listing} width={600} />;
                        })()}
                    </Box>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default ListingDetailPage;

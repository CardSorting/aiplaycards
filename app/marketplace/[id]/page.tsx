'use client';
import { useSession } from 'next-auth/react';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Avatar,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
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
import Link from 'next/link';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import BoltIcon from '@mui/icons-material/Bolt';
import LockIcon from '@mui/icons-material/Lock';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Routes from '@routes';
import {
  CardDisplayWrapper,
  MTGCardDisplayWrapper,
  YugiohCardDisplayWrapper,
  normalizeCardData,
  useCardLoadingState,
} from '@components/CardDisplayWrapper';
import { SEO } from '@layout';

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const authUser = session?.user;
  const id = params?.id as string;
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

  // Use the card loading hook for related listings
  const { handleCardLoad, isCardLoaded } = useCardLoadingState();

  // Helper function to choose the correct card wrapper based on card type/category
  const getCardWrapper = (card: any) => {
    if (!card) return CardDisplayWrapper;

    // Check if this is an MTG card
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

    // Check if this is a Yu-Gi-Oh card
    if (card.category === 'yugioh' || card.cardEditorState?.cardType) {
      return YugiohCardDisplayWrapper;
    }

    // Default to Pokemon wrapper
    return CardDisplayWrapper;
  };

  useEffect(() => {
    let active = true;
    async function load() {
      const res = await fetch(`/api/marketplace/${id}`);
      const data = await res.json();
      if (active) {
        // Normalize the listing data for consistent field naming
        const normalizedListing = data?.data
          ? normalizeCardData(data.data)
          : null;
        setListing(normalizedListing);
      }
    }
    if (id) load();
    return () => {
      active = false;
    };
  }, [id]);

  // Fetch the card details for richer product info
  useEffect(() => {
    let active = true;
    async function loadCard() {
      if (!listing?.cardId) return;
      try {
        const res = await fetch(`/api/cards/${listing.cardId}`);
        const data = await res.json();
        if (active) setCard(data?.data || null);
      } catch {}
    }
    loadCard();
    return () => {
      active = false;
    };
  }, [listing?.cardId]);

  // Fetch seller profile to mirror /u/[username] strategy
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
      } catch {}
    }
    loadSeller();
    return () => {
      active = false;
    };
  }, [listing?.sellerUsername, listing?.sellerUserId]);

  // Load likes for the underlying card
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
      } catch {}
    }
    loadLikes();
    return () => {
      active = false;
    };
  }, [listing?.cardId]);

  // Load related listings
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
      } catch {}
    }
    loadRelated();
    return () => {
      active = false;
    };
  }, [listing?.cardId, listing?.id, listing?.type]);

  const toggleLike = async () => {
    if (!listing?.cardId) return;
    if (!authUser) {
      router.push(Routes.Login);
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

  // Enhanced SEO metadata generation
  const generateEnhancedDescription = () => {
    if (!listing)
      return 'Custom Pokemon trading card available for purchase on PlayMore TCG marketplace.';

    const price = parseFloat(
      listing.priceUsd || listing.priceCredits / 100 || '0',
    ).toFixed(2);
    const type = listing.type || 'Pokemon';
    const rarity = listing.rarity || '';
    const seller = sellerDisplay || 'seller';

    let description = `Buy ${listing.name} - a custom ${type} trading card for $${price} on PlayMore TCG marketplace.`;

    if (rarity) {
      description += ` This ${rarity} card is available for immediate purchase.`;
    }

    if (seller) {
      description += ` Sold by ${seller}.`;
    }

    description +=
      ' Secure checkout with PayPal. Instant digital delivery to your collection.';

    return description;
  };

  const generateEnhancedKeywords = () => {
    if (!listing)
      return 'Pokemon cards, marketplace, buy cards, trading cards, PlayMore TCG';

    const keywords = [
      listing.name,
      'Pokemon card',
      'custom card',
      listing.type,
      listing.rarity,
      'marketplace',
      'buy cards',
      'trading cards',
      'PlayMore TCG',
      'digital cards',
      'collectible cards',
      'card trading',
      'secure purchase',
      'PayPal payment',
    ];

    if (listing.supertype) keywords.push(listing.supertype);
    if (listing.subtype) keywords.push(listing.subtype);
    if (listing.illustrator) keywords.push(listing.illustrator);
    if (sellerDisplay) keywords.push(sellerDisplay);

    return keywords.filter(Boolean).join(', ');
  };

  const generateArticleTags = () => {
    if (!listing)
      return ['Pokemon', 'trading card', 'custom card', 'marketplace'];

    const tags = [
      listing.type || 'Pokemon',
      'trading card',
      'custom card',
      'marketplace',
      'digital collection',
    ];

    if (listing.rarity) tags.push(listing.rarity);
    if (listing.supertype) tags.push(listing.supertype);
    if (listing.subtype) tags.push(listing.subtype);

    return tags;
  };

  // FAQ data for SEO content
  const faqData = [
    {
      question: 'How do I buy this card?',
      answer:
        "Click the 'Buy Now' button and complete your purchase securely with PayPal. The card will be instantly delivered to your collection.",
    },
    {
      question: 'Is this an official Pokemon card?',
      answer:
        'No, this is a custom AI-generated Pokemon card created on the PlayMore TCG platform. Each card is unique and created using our advanced AI technology.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We accept PayPal for all marketplace transactions. Payments are processed securely and instantly.',
    },
    {
      question: 'How do I know the seller is trustworthy?',
      answer:
        'All sellers on our platform are verified users. You can view their profile and sales history before making a purchase.',
    },
    {
      question: 'Can I get a refund?',
      answer:
        "Due to the digital nature of our cards, all sales are final. However, if there's an issue with your purchase, please contact our support team.",
    },
  ];

  const handleFaqChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setFaqExpanded(isExpanded ? panel : false);
    };

  // Handle buy now - redirect to checkout page
  const handleBuyNow = useCallback(() => {
    if (!authUser) {
      router.push(Routes.Login);
      return;
    }
    if (listing?.id) {
      router.push(`/checkout/marketplace/${listing.id}`);
    }
  }, [authUser, listing, router]);

  return (
    <>
      <SEO
        title={`${
          listing?.name || 'Trading Card'
        } - Marketplace | PlayMore TCG`}
        description={generateEnhancedDescription()}
        keywords={generateEnhancedKeywords()}
        image={
          listing?.imageData?.dataUrl ||
          (Array.isArray(listing?.imageData?.generated) &&
            listing?.imageData?.generated[0]) ||
          listing?.primaryImage ||
          'https://playmoretcg.com/assets/images/banner.png'
        }
        url={`${
          process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com'
        }/marketplace/${params.id}`}
        type="product"
        articleTags={generateArticleTags()}
        publishedTime={listing?.createdAt}
        modifiedTime={listing?.updatedAt}
        articleAuthor={sellerDisplay || 'PlayMore TCG'}
        articleSection="Marketplace"
        noindex={false}
        nofollow={false}
        alternateLanguages={{
          'en-US': `${
            process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com'
          }/marketplace/${params.id}`,
          en: `${
            process.env.NEXT_PUBLIC_SITE_URL || 'https://playmoretcg.com'
          }/marketplace/${params.id}`,
        }}
      />

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Stack spacing={1} sx={{ mb: 2 }}>
          <Breadcrumbs aria-label="breadcrumb">
            <MUILink component={Link} href="/">
              Home
            </MUILink>
            <MUILink component={Link} href="/marketplace">
              Marketplace
            </MUILink>
            <Typography color="text.primary">
              {listing?.name || 'Listing'}
            </Typography>
          </Breadcrumbs>
          <Typography variant="h4" fontWeight={800}>
            Product Details
          </Typography>
        </Stack>

        {listing ? (
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
                  {listing ? (
                    (() => {
                      const CardWrapper = getCardWrapper(listing);
                      return (
                        <CardWrapper
                          card={listing}
                          width="constrained"
                          fallbackContent={
                            <Skeleton
                              variant="rectangular"
                              width="100%"
                              height={420}
                              sx={{ borderRadius: 1 }}
                            />
                          }
                        />
                      );
                    })()
                  ) : (
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={420}
                      sx={{ borderRadius: 1 }}
                    />
                  )}
                </Box>
                {Array.isArray(listing?.imageData?.thumbs) &&
                  listing!.imageData!.thumbs!.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        p: 1.5,
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                      }}
                    >
                      {listing!
                        .imageData!.thumbs!.slice(0, 6)
                        .map((t: string, idx: number) => (
                          <Box
                            key={idx}
                            component="img"
                            src={t}
                            alt={`${listing.name} thumbnail ${idx + 1}`}
                            sx={{
                              width: 56,
                              height: 78,
                              objectFit: 'cover',
                              borderRadius: 1,
                              border: theme =>
                                `2px solid ${
                                  selectedImageUrl === t
                                    ? theme.palette.primary.main
                                    : 'transparent'
                                }`,
                              cursor: 'pointer',
                            }}
                            onClick={() => setSelectedImageUrl(t)}
                          />
                        ))}
                    </Box>
                  )}
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack
                spacing={2}
                sx={{ position: isMdUp ? 'sticky' : 'static', top: 84 }}
              >
                <Typography variant="h5" fontWeight={700}>
                  {listing.name}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Chip size="small" label={listing.type} />
                  <Chip
                    size="small"
                    color="success"
                    label={`$${parseFloat(
                      listing.priceUsd || listing.priceCredits / 100 || '0',
                    ).toFixed(2)}`}
                  />
                  <Tooltip title="Share">
                    <IconButton
                      size="small"
                      onClick={() =>
                        navigator?.clipboard?.writeText(window.location.href)
                      }
                      aria-label="Copy product link"
                    >
                      <ShareIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                    <IconButton
                      size="small"
                      color={isLiked ? 'error' : 'default'}
                      onClick={toggleLike}
                      disabled={likesBusy}
                      aria-label="Toggle like"
                    >
                      {isLiked ? (
                        <FavoriteIcon fontSize="small" />
                      ) : (
                        <FavoriteBorderIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Typography variant="caption" color="text.secondary">
                    {likesCount}
                  </Typography>
                </Stack>
                {(sellerUsername || sellerUserId) && (
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 0.5 }}
                  >
                    <Avatar
                      src={sellerProfile?.avatarUrl || undefined}
                      sx={{ width: 32, height: 32, fontSize: 14 }}
                    >
                      {sellerAvatarLetter}
                    </Avatar>
                    <Typography variant="body2" fontWeight={700}>
                      {sellerDisplay}
                    </Typography>
                  </Stack>
                )}
                {(sellerUsername || sellerUserId) && (
                  <MUILink
                    component={Link}
                    href={`/u/${encodeURIComponent(sellerLinkHandle)}`}
                    underline="hover"
                    sx={{ fontSize: 13, alignSelf: 'flex-start' }}
                  >
                    View {sellerDisplay || 'seller'} profile
                  </MUILink>
                )}
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    About this card
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    This is a listing for a custom trading card from PlayMore
                    TCG. Review the card details and proceed to purchase if you
                    like it.
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Typography variant="h4" sx={{ fontWeight: 800 }}>
                    $
                    {parseFloat(
                      listing.priceUsd || listing.priceCredits / 100 || '0',
                    ).toFixed(2)}
                  </Typography>
                  <Chip
                    size="small"
                    color="error"
                    label="Only 1 left in stock"
                    sx={{ width: 'fit-content' }}
                  />
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                    <Button
                      size="large"
                      variant="contained"
                      onClick={handleBuyNow}
                      startIcon={<BoltIcon />}
                    >
                      Buy Now
                    </Button>
                  </Stack>
                  <Chip
                    icon={<LockIcon />}
                    label="Secure checkout"
                    variant="outlined"
                    sx={{ alignSelf: 'flex-start' }}
                  />
                  <Stack spacing={1} sx={{ mt: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <LocalShippingIcon color="action" fontSize="small" />
                      <Typography variant="caption">
                        Instant delivery to your collection
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Listing ID: {listing.id}
                  </Typography>
                </Box>

                {/* Card details inline */}
                {listing && (
                  <Stack spacing={1} sx={{ mt: 2 }}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      Card Details
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      flexWrap="wrap"
                    >
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
                      {listing.rarity && (
                        <Chip
                          size="small"
                          color="warning"
                          label={listing.rarity}
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
                    <Typography variant="body2" color="text.secondary">
                      {listing.illustrator
                        ? `Illustrated by ${listing.illustrator}`
                        : ''}
                    </Typography>
                    {listing.cardEditorState?.cardNumber &&
                      listing.cardEditorState?.totalInSet && (
                        <Typography variant="body2" color="text.secondary">
                          #{listing.cardEditorState.cardNumber} of{' '}
                          {listing.cardEditorState.totalInSet}
                        </Typography>
                      )}
                  </Stack>
                )}
              </Stack>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Card>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 16,
                    backgroundColor: '#f8f9fa',
                  }}
                >
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={420}
                    sx={{ borderRadius: 1 }}
                  />
                </div>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack spacing={2}>
                <Skeleton width={240} height={36} />
                <Skeleton width={160} height={28} />
                <Skeleton width="80%" height={18} />
                <Skeleton width="60%" height={18} />
                <Skeleton width={200} height={48} />
              </Stack>
            </Grid>
          </Grid>
        )}

        {/* FAQ Section for SEO */}
        {listing && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Frequently Asked Questions
            </Typography>
            <Accordion
              expanded={faqExpanded === 'panel1'}
              onChange={handleFaqChange('panel1')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  How do I buy this card?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  Click the 'Buy Now' button and complete your purchase securely
                  with PayPal. The card will be instantly delivered to your
                  collection.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={faqExpanded === 'panel2'}
              onChange={handleFaqChange('panel2')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  Is this an official Pokemon card?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  No, this is a custom AI-generated Pokemon card created on the
                  PlayMore TCG platform. Each card is unique and created using
                  our advanced AI technology.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={faqExpanded === 'panel3'}
              onChange={handleFaqChange('panel3')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  What payment methods are accepted?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  We accept PayPal for all marketplace transactions. Payments
                  are processed securely and instantly.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion
              expanded={faqExpanded === 'panel4'}
              onChange={handleFaqChange('panel4')}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1" fontWeight={600}>
                  How do I know the seller is trustworthy?
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  All sellers on our platform are verified users. You can view
                  their profile and sales history before making a purchase.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Box>
        )}

        {/* Related Listings Section */}
        {relatedListings.length > 0 && (
          <Box sx={{ mt: 6 }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
              Related {listing?.type} Cards
            </Typography>
            <Grid container spacing={2}>
              {relatedListings.map(relatedListing => (
                <Grid item xs={12} sm={6} md={3} key={relatedListing.id}>
                  <Card>
                    <CardActionArea
                      component={Link}
                      href={`/marketplace/${relatedListing.id}`}
                    >
                      <Box
                        sx={{
                          p: 2,
                          backgroundColor: '#f8f9fa',
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {(() => {
                          const CardWrapper = getCardWrapper(relatedListing);
                          return (
                            <CardWrapper
                              card={relatedListing}
                              width="constrained"
                              fallbackContent={
                                <Skeleton
                                  variant="rectangular"
                                  width="100%"
                                  height={200}
                                  sx={{ borderRadius: 1 }}
                                />
                              }
                            />
                          );
                        })()}
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                          {relatedListing.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          noWrap
                        >
                          {relatedListing.type} • {relatedListing.rarity}
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight={700}
                          color="primary"
                        >
                          $
                          {parseFloat(
                            relatedListing.priceUsd ||
                              relatedListing.priceCredits / 100 ||
                              '0',
                          ).toFixed(2)}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Mobile sticky buy bar */}
        {!isMdUp && listing && (
          <Box
            sx={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              bgcolor: 'background.paper',
              borderTop: theme => `1px solid ${theme.palette.divider}`,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 1200,
            }}
          >
            <Typography variant="subtitle1" fontWeight={800}>
              $
              {parseFloat(
                listing.priceUsd || listing.priceCredits / 100 || '0',
              ).toFixed(2)}
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleBuyNow}
              startIcon={<BoltIcon />}
            >
              Buy Now
            </Button>
          </Box>
        )}

        {/* Image zoom dialog */}
        <Dialog
          open={imageDialogOpen}
          onClose={() => setImageDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography variant="subtitle1">{listing?.name}</Typography>
            <IconButton
              onClick={() => setImageDialogOpen(false)}
              aria-label="Close image preview"
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            dividers
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {(() => {
              const primaryImage =
                selectedImageUrl ||
                listing?.imageData?.dataUrl ||
                (Array.isArray(listing?.imageData?.generated) &&
                  listing.imageData.generated[0]) ||
                listing?.primaryImage;
              if (primaryImage) {
                return (
                  <img
                    src={primaryImage as string}
                    alt={listing?.name || 'Card'}
                    style={{ width: '100%', height: 'auto', borderRadius: 8 }}
                  />
                );
              }
              return (
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={420}
                  sx={{ borderRadius: 1 }}
                />
              );
            })()}
          </DialogContent>
        </Dialog>
      </Container>
    </>
  );
}

import React, { FC, useEffect, useState } from 'react';
import {
    Alert,
    Avatar,
    Box,
    CircularProgress,
    Container,
    Fade,
    Paper,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';
import { MonetizationOn, Star, TrendingUp } from '@mui/icons-material';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import FreeCreditClaim from '@/components/FreeCreditClaim';

const CreditsPage: FC = () => {
    const { data: session } = useSession();
    const user = session?.user;
    const [userCredits, setUserCredits] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [animateIn, setAnimateIn] = useState(false);

    useEffect(() => {
        async function loadCredits() {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const response = await fetch('/api/credits');
                const data = await response.json();
                setUserCredits(data.credits || 0);
            } catch (error) {
                console.error('Failed to load credits:', error);
                setUserCredits(0);
            } finally {
                setLoading(false);
                // Trigger entrance animation
                setTimeout(() => setAnimateIn(true), 100);
            }
        }

        loadCredits();
    }, [user]);

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 6 }}>
                <SEO title="Free Credits" description="Sign in to claim free credits." />
                <Fade in timeout={800}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 6,
                            textAlign: 'center',
                            bgcolor: 'background.default',
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 80,
                                height: 80,
                                mx: 'auto',
                                mb: 3,
                                bgcolor: 'primary.main',
                            }}
                        >
                            <MonetizationOn sx={{ fontSize: 40 }} />
                        </Avatar>
                        <Typography variant="h4" fontWeight={700} gutterBottom>
                            Ready to Start Your Journey?
                        </Typography>
                        <Alert severity="info" sx={{ fontSize: '1.1rem', py: 2, mt: 2 }}>
                            Please sign in to claim free credits and unlock the full PlayMore
                            TCG experience!
                        </Alert>
                    </Paper>
                </Fade>
            </Container>
        );
    }

    if (loading) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <Stack spacing={3} alignItems="center">
                    <CircularProgress size={80} thickness={4} />
                    <Typography variant="h6" sx={{ color: 'text.secondary' }}>
                        Loading your credit balance...
                    </Typography>
                    <Stack spacing={1} sx={{ width: '100%', maxWidth: 400 }}>
                        <Skeleton
                            variant="rectangular"
                            height={60}
                            sx={{ borderRadius: 2 }}
                        />
                        <Skeleton
                            variant="rectangular"
                            height={40}
                            sx={{ borderRadius: 2 }}
                        />
                    </Stack>
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <SEO title="Free Credits" description="Claim free credits daily to build your PlayMore TCG collection!" />
            <Fade in={animateIn} timeout={1000}>
                <Stack spacing={6}>
                    {/* Header Section */}
                    <Box textAlign="center" sx={{ mb: 2 }}>
                        <Typography
                            variant="h1"
                            fontWeight={900}
                            gutterBottom
                            sx={{
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                fontSize: { xs: '2.5rem', sm: '3rem', md: '4rem' },
                                mb: 2,
                            }}
                        >
                            Free Credits
                        </Typography>

                        <Typography
                            variant="h5"
                            color="text.secondary"
                            sx={{
                                fontWeight: 400,
                                maxWidth: '700px',
                                mx: 'auto',
                                mb: 4,
                                lineHeight: 1.6,
                            }}
                        >
                            Claim free credits daily to build your PlayMore TCG collection!
                        </Typography>

                        {/* Current Balance Display */}
                        <Paper
                            elevation={8}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                px: 4,
                                py: 3,
                                borderRadius: 4,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                color: 'white',
                                position: 'relative',
                                overflow: 'hidden',
                                '&::before': {
                                    content: '""',
                                    position: 'absolute',
                                    top: 0,
                                    left: '-100%',
                                    width: '100%',
                                    height: '100%',
                                    background:
                                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                                    animation: 'shimmer 2s infinite',
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                    position: 'relative',
                                    zIndex: 1,
                                }}
                            >
                                <Avatar
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.2)',
                                        width: 48,
                                        height: 48,
                                    }}
                                >
                                    <MonetizationOn sx={{ fontSize: 24 }} />
                                </Avatar>
                                <Box sx={{ textAlign: 'left' }}>
                                    <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>
                                        Current Balance
                                    </Typography>
                                    <Typography variant="h4" fontWeight={700}>
                                        {userCredits?.toLocaleString()} credits
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>
                    </Box>

                    {/* Free Credit Claim Component */}
                    <Box display="flex" justifyContent="center">
                        <FreeCreditClaim />
                    </Box>

                    {/* Footer Information */}
                    <Box textAlign="center" sx={{ mt: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 5,
                                bgcolor: 'background.default',
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                            }}
                        >
                            <Stack spacing={3} alignItems="center">
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Avatar
                                        sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}
                                    >
                                        <Star />
                                    </Avatar>
                                    <Typography variant="h5" fontWeight={700}>
                                        Build Your Collection
                                    </Typography>
                                </Box>
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ maxWidth: '600px', lineHeight: 1.7 }}
                                >
                                    Free credits never expire and can be used to open booster
                                    packs, create AI-powered cards, and access all premium
                                    features. Come back daily to claim more credits and expand
                                    your collection!
                                </Typography>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        color: 'success.main',
                                    }}
                                >
                                    <TrendingUp />
                                    <Typography variant="body2" fontWeight={600}>
                                        Daily Rewards • Unlimited Potential • Free Forever
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Box>
                </Stack>
            </Fade>
        </Container>
    );
};

export default CreditsPage;

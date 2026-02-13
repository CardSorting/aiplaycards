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
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '@hooks/useSession';
import { SEO } from '@layout';
import {
    CardDisplayWrapper,
    normalizeCardData,
    useCardLoadingState,
    usePagination,
} from '@/components/CardDisplayWrapper';

const steps = ['Select Cards', 'Configure Pack', 'Review & Create'];

const CreatePackPage: FC = () => {
    const navigate = useNavigate();
    const { data: session } = useSession();
    const user = session?.user;
    const [activeStep, setActiveStep] = useState(0);

    const [cards, setCards] = useState<any[]>([]);
    const [selectedCards, setSelectedCards] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [packName, setPackName] = useState('');
    const [packDescription, setPackDescription] = useState('');
    const [packSize, setPackSize] = useState(5);
    const [totalPacks, setTotalPacks] = useState(10);
    const [creating, setCreating] = useState(false);

    const { handleCardLoad, isCardLoaded } = useCardLoadingState();
    const { page, setPage, total, setTotal, itemsPerPage } = usePagination(20);

    const fetchUserCards = useCallback(async () => {
        if (!user) return;
        setLoading(true);
        try {
            const offset = (page - 1) * itemsPerPage;
            const response = await fetch(
                `/api/cards?userId=${user.id}&isPublic=true&limit=${itemsPerPage}&offset=${offset}&view=summary`,
            );
            if (!response.ok) throw new Error('Failed to fetch cards');
            const data = await response.json();
            const normalized = Array.isArray(data.data) ? data.data.map(normalizeCardData) : [];
            setCards(normalized);
            setTotal(data.total || normalized.length || 0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load cards');
        } finally {
            setLoading(false);
        }
    }, [user, page, itemsPerPage]);

    useEffect(() => { fetchUserCards(); }, [fetchUserCards]);

    const toggleCardSelection = (card: any) => {
        const isSelected = selectedCards.some(c => c.id === card.id);
        if (isSelected) {
            setSelectedCards(prev => prev.filter(c => c.id !== card.id));
        } else {
            setSelectedCards(prev => [...prev, { ...card, weight: 1 }]);
        }
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(packData),
            });
            if (!response.ok) throw new Error('Failed to create pack');
            const result = await response.json();
            navigate(`/gallery/packs/${result.id}`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create pack');
        } finally {
            setCreating(false);
        }
    };

    if (!user) {
        return (
            <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
                <SEO title="Create Pack" description="Sign in to create your own booster packs." />
                <Typography variant="h4" gutterBottom>Login Required</Typography>
                <Button component={Link} to="/signin" variant="contained">Sign In</Button>
            </Container>
        );
    }

    return (
        <>
            <SEO title="Create Pack | PlayMore TCG" description="Create a custom booster pack from your public card collection." />
            <Container maxWidth="xl" sx={{ py: 4 }}>
                <Breadcrumbs aria-label="breadcrumb">
                    <MUILink component={Link} to="/">Home</MUILink>
                    <MUILink component={Link} to="/gallery">Gallery</MUILink>
                    <Typography color="text.primary">Create Pack</Typography>
                </Breadcrumbs>

                <Stepper activeStep={activeStep} sx={{ my: 4 }}>
                    {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                {activeStep === 0 && (
                    <Grid container spacing={2}>
                        {cards.map(card => (
                            <Grid item xs={6} sm={4} md={3} key={card.id}>
                                <Card sx={{ position: 'relative', border: selectedCards.some(c => c.id === card.id) ? 2 : 0, borderColor: 'primary.main' }} onClick={() => toggleCardSelection(card)}>
                                    <Box sx={{ p: 1, backgroundColor: '#f8f9fa' }}>
                                        <CardDisplayWrapper card={card} width="responsive" />
                                    </Box>
                                    <CardContent><Typography variant="subtitle2" noWrap>{card.name}</Typography></CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {activeStep === 1 && (
                    <Stack spacing={3} maxWidth="md">
                        <TextField fullWidth label="Pack Name" value={packName} onChange={e => setPackName(e.target.value)} />
                        <TextField fullWidth label="Pack Description" multiline rows={3} value={packDescription} onChange={e => setPackDescription(e.target.value)} />
                    </Stack>
                )}

                {activeStep === 2 && (
                    <Box>
                        <Typography variant="h6">Review Your Pack</Typography>
                        <Typography>Name: {packName}</Typography>
                        <Typography>Cards: {selectedCards.length}</Typography>
                    </Box>
                )}

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                    <Button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)}>Back</Button>
                    {activeStep < 2 ? (
                        <Button variant="contained" onClick={() => setActiveStep(s => s + 1)}>Next</Button>
                    ) : (
                        <Button variant="contained" onClick={handleCreatePack} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
                    )}
                </Stack>
            </Container>
        </>
    );
};

export default CreatePackPage;

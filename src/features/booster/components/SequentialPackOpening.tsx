import { useEffect, useState } from 'react';
import {
    Box,
    Button,
    Chip,
    Fade,
    LinearProgress,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { CardDisplayWrapper } from '@components/CardDisplayWrapper';
import { normalizeCardData } from '@components/CardDisplayWrapper/utils';
import { CardData } from '@components/CardDisplayWrapper/types';
import { useBoosterOpening } from '../hooks/useBoosterOpening';
import { getPackBySlug } from '@features/booster/packs';
import {
    cardImgHeight,
    cardImgWidth,
} from '@features/cardEditor/cardStyles';

interface SequentialPackOpeningProps {
    packSlug: string;
    onComplete?: () => void;
}

export default function SequentialPackOpening({
    packSlug,
    onComplete,
}: SequentialPackOpeningProps) {
    const pack = getPackBySlug(packSlug);
    const navigate = useNavigate();
    const [actualCardData, setActualCardData] = useState<CardData | null>(null);
    const [isLoadingCard, setIsLoadingCard] = useState(false);

    const {
        drawing,
        error,
        loadingPhase,
        dynamicMessage,
        lastCard,
        openSingle,
        isBusy,
        drop,
        queuePosition,
        estimatedWaitTime,
    } = useBoosterOpening(packSlug);

    const handleOpenPack = () => {
        openSingle(packSlug);
    };

    const handleReset = () => {
        // Reset by refreshing the page or resetting state
        // In React Router, we might prefer resetting state instead of full reload
        setActualCardData(null);
        setIsLoadingCard(false);
        window.location.reload();
    };

    // Fetch actual card data from database when lastCard is available
    useEffect(() => {
        if (lastCard?.createdCardId && !actualCardData) {
            setIsLoadingCard(true);
            fetch(`/api/cards/${lastCard.createdCardId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success && data.data) {
                        // Normalize the card data using the shared utility
                        const normalizedCard = {
                            ...normalizeCardData(data.data),
                            isPublic: data.data.isPublic,
                            cardNumber: data.data.cardNumber,
                            totalInSet: data.data.totalInSet,
                            createdAt: data.data.createdAt,
                            updatedAt: data.data.updatedAt,
                            userId: data.data.userId,
                        } as CardData;
                        setActualCardData(normalizedCard);
                    }
                })
                .catch(err => {
                    console.error('Failed to fetch card data:', err);
                })
                .finally(() => {
                    setIsLoadingCard(false);
                });
        }
    }, [lastCard?.createdCardId, actualCardData]);

    // Convert internal card data to CardDisplayWrapper format
    const getCardDisplayData = (card: any): CardData => {
        // If we have a createdCardId, fetch the actual card data from the database
        if (card.createdCardId) {
            return {
                id: card.createdCardId,
                name: card.pokemonName || card.name || '',
                type: card.card?.typeId
                    ? getTypeNameFromId(card.card.typeId)
                    : 'Colorless',
                subtype: card.card?.subtypeId
                    ? getSubtypeNameFromId(card.card.subtypeId)
                    : undefined,
                supertype: card.card?.supertypeId
                    ? getSupertypeNameFromId(card.card.supertypeId)
                    : 'Pokémon',
                rarity:
                    card.rarity || card.card?.rarityId
                        ? getRarityNameFromId(card.card.rarityId)
                        : 'Common',
                hitpoints: card.card?.hitpoints,
                illustrator: card.card?.illustrator || undefined,
                description: card.card?.description || undefined,
                dexStats: card.card?.dexStats,

                ability: card.card?.ability || undefined,
                moves:
                    card.card?.move1 || card.card?.move2
                        ? [card.card.move1, card.card.move2].filter(Boolean).map((move: any) => ({
                            name: move!.name,
                            description: move!.description,
                            damageAmount: move!.damageAmount,
                            damageModifier: move!.damageModifier || undefined,
                            energyCost: move!.energyCost,
                        }))
                        : undefined,
                cardEditorState: card.cardEditorState,
                imageData: card.imageUrl
                    ? { generated: [card.imageUrl], thumbs: [] }
                    : undefined,
                isPublic: true,
                createdAt: new Date().toISOString(),
            };
        }

        // Fallback for cards without createdCardId
        return {
            id: Date.now(),
            name: card.pokemonName || card.name || '',
            type: card.card?.typeId
                ? getTypeNameFromId(card.card.typeId)
                : 'Colorless',
            subtype: card.card?.subtypeId
                ? getSubtypeNameFromId(card.card.subtypeId)
                : undefined,
            supertype: card.card?.supertypeId
                ? getSupertypeNameFromId(card.card.supertypeId)
                : 'Pokémon',
            rarity:
                card.rarity || card.card?.rarityId
                    ? getRarityNameFromId(card.card.rarityId)
                    : 'Common',
            hitpoints: card.card?.hitpoints,
            illustrator: card.card?.illustrator || undefined,
            description: card.card?.description || undefined,
            dexStats: card.card?.dexStats,

            ability: card.card?.ability || undefined,
            moves:
                card.card?.move1 || card.card?.move2
                    ? [card.card.move1, card.card.move2].filter(Boolean).map((move: any) => ({
                        name: move!.name,
                        description: move!.description,
                        damageAmount: move!.damageAmount,
                        damageModifier: move!.damageModifier || undefined,
                        energyCost: move!.energyCost,
                    }))
                    : undefined,
            cardEditorState: card.cardEditorState,
            imageData: card.imageUrl
                ? { generated: [card.imageUrl], thumbs: [] }
                : undefined,
            isPublic: true,
            createdAt: new Date().toISOString(),
        };
    };

    if (error) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="error" variant="h6" sx={{ mb: 2 }}>
                    {error}
                </Typography>
                <Button onClick={handleReset} variant="outlined">
                    Try Again
                </Button>
            </Box>
        );
    }

    if (drawing) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                    Opening {pack.name} Pack...
                </Typography>
                <LinearProgress sx={{ mb: 2 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {dynamicMessage}
                </Typography>
                {queuePosition && (
                    <Typography variant="body2" color="text.secondary">
                        Queue position: ~{queuePosition} • Estimated wait: ~
                        {estimatedWaitTime} minutes
                    </Typography>
                )}
            </Box>
        );
    }

    if (!drawing && !lastCard) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, color: 'primary.main' }}>
                    Ready to Open a {pack.name} Pack?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    This pack contains 1 AI-generated card. Click to open and reveal it!
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                    <Box
                        sx={{
                            width: 200,
                            height: 280,
                            borderRadius: 3,
                            background: pack.gradient,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            '&:hover': {
                                transform: 'scale(1.05)',
                            },
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                        }}
                        onClick={handleOpenPack}
                    >
                        <Typography variant="h2" sx={{ fontSize: 60 }}>
                            {pack.emoji || '🎴'}
                        </Typography>
                    </Box>
                </Box>

                <Button
                    variant="contained"
                    size="large"
                    onClick={handleOpenPack}
                    disabled={isBusy || drop?.status !== 'active'}
                    sx={{
                        minWidth: 200,
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                    }}
                >
                    Open Pack
                </Button>

                {drop?.creditCost && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Cost: {drop.creditCost} credits
                    </Typography>
                )}
            </Box>
        );
    }

    if (lastCard) {
        // Use actual card data from database if available, otherwise use generated data
        const displayCard = actualCardData || getCardDisplayData(lastCard);

        return (
            <Box>
                {/* Card display */}
                <Fade in={!!lastCard} timeout={500}>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                        <Box sx={{ position: 'relative' }}>
                            {isLoadingCard ? (
                                <Box
                                    sx={{
                                        width: { xs: 280, sm: 350, md: 450, lg: 500 },
                                        aspectRatio: `${cardImgWidth}/${cardImgHeight}`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: '#f8f9fa',
                                        borderRadius: 2,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        Loading card...
                                    </Typography>
                                </Box>
                            ) : (
                                <CardDisplayWrapper
                                    key={`pack-card-${lastCard.createdCardId}`}
                                    card={displayCard}
                                    aspectRatio={`${cardImgWidth}/${cardImgHeight}`}
                                    width={{ xs: 280, sm: 350, md: 450, lg: 500 }}
                                />
                            )}

                            {/* Rarity indicator */}
                            <Box sx={{ position: 'absolute', top: -12, right: -12 }}>
                                <Chip
                                    label={lastCard.rarity}
                                    size="small"
                                    color={
                                        lastCard.rarity === 'rare'
                                            ? 'warning'
                                            : lastCard.rarity === 'uncommon'
                                                ? 'info'
                                                : 'default'
                                    }
                                    sx={{ fontWeight: 600 }}
                                />
                            </Box>
                        </Box>
                    </Box>
                </Fade>

                {/* Action buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={handleReset}
                        sx={{ minWidth: 120 }}
                    >
                        Open Another
                    </Button>
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() => navigate('/')}
                        sx={{ minWidth: 120 }}
                    >
                        Done
                    </Button>
                </Box>
            </Box>
        );
    }

    return null;
}

// Helper functions to convert IDs to names for CardDisplayWrapper
const getTypeNameFromId = (typeId?: number): string => {
    const typeMap: Record<number, string> = {
        1: 'Grass',
        2: 'Fire',
        3: 'Water',
        4: 'Lightning',
        5: 'Psychic',
        6: 'Fighting',
        7: 'Dark',
        8: 'Metal',
        9: 'Dragon',
        10: 'Fairy',
        11: 'Colorless',
    };
    return typeMap[typeId || 11] || 'Colorless';
};

const getSupertypeNameFromId = (supertypeId?: number): string => {
    return supertypeId === 2
        ? 'Trainer'
        : supertypeId === 3
            ? 'Energy'
            : 'Pokémon';
};

const getSubtypeNameFromId = (subtypeId?: number): string => {
    const subtypeMap: Record<number, string> = {
        1: 'Basic',
        2: 'Stage 1',
        3: 'Stage 2',
        4: 'Baby',
        5: 'Restored',
        6: 'Level-Up',
        7: 'MEGA',
        8: 'BREAK',
        9: 'GX',
        10: 'TAG TEAM',
        11: 'V',
        12: 'VMAX',
        13: 'VSTAR',
    };
    return subtypeMap[subtypeId || 1] || 'Basic';
};

const getRarityNameFromId = (rarityId?: number): string => {
    const rarityMap: Record<number, string> = {
        1: 'Common',
        2: 'Rare Holo',
        3: 'Rare Secret',
        4: 'Rainbow',
        5: 'Supporter Full Art',
        6: 'Gold Star',
        7: 'Gilded',
        8: 'Character Rare',
    };
    return rarityMap[rarityId || 1] || 'Common';
};

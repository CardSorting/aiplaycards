import { FC, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Button,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Card as MuiCard,
    Skeleton,
    Stack,
    Typography,
} from '@mui/material';

import { SEO } from '@layout';
import Routes from '@routes';
import { CardData } from '@components/CardDisplayWrapper/types';
import { CardInterface } from '@cardEditor/types';
import { useBoosterOpening } from '@features/booster/hooks/useBoosterOpening';
import SequentialPackOpening from '@features/booster/components/SequentialPackOpening';
import { getPackBySlug } from '@features/booster/packs';
import { GeneratedCard } from '@features/booster/types';

const BoosterPack: FC = () => {
    const params = useParams<{ slug: string }>();
    const pack = useMemo(
        () => getPackBySlug(params.slug),
        [params.slug],
    );

    const boosterState = useBoosterOpening(pack.slug);
    const { lastCard, drop } = boosterState;

    const createCardDataFromGenerated = useCallback(
        (
            generated: GeneratedCard,
            imageUrl?: string | null,
            cardId?: number,
            cardEditorState?: CardInterface,
        ): CardData => {
            return {
                id: cardId || Date.now(),
                name: generated.name || '',
                type: getTypeNameFromId(generated.typeId),
                subtype: getSubtypeNameFromId(generated.subtypeId ?? undefined),
                supertype: getSupertypeNameFromId(generated.supertypeId),
                rarity: getRarityNameFromId(generated.rarityId ?? undefined),
                hitpoints: generated.hitpoints,
                illustrator: generated.illustrator || undefined,
                description: generated.description || undefined,
                dexStats: generated.dexStats,

                ability: generated.ability || undefined,
                moves:
                    generated.move1 || generated.move2
                        ? [generated.move1, generated.move2].filter(Boolean).map(move => ({
                            name: move!.name,
                            description: move!.description,
                            damageAmount: move!.damageAmount,
                            damageModifier: move!.damageModifier || undefined,
                            energyCost: move!.energyCost,
                        }))
                        : undefined,
                cardEditorState:
                    cardEditorState ||
                    ({
                        name: generated.name || '',
                        subname: generated.subname || '',
                        backgroundImg: imageUrl ? { src: imageUrl } : undefined,
                        cardNumber: generated.cardNumber || '',
                        totalInSet: generated.totalInSet || '',
                        hitpoints: generated.hitpoints || '',
                        illustrator: generated.illustrator || '',
                        retreatCost: generated.retreatCost || 1,
                        dexStats: generated.dexStats || '',

                        description: generated.description || '',
                        hasAbility: !!generated?.hasAbility && !!generated?.ability,
                        ability: generated.ability
                            ? {
                                name: generated.ability.name,
                                description: generated.ability.description,
                            }
                            : { name: '', description: '' },
                        move1: generated.move1
                            ? {
                                name: generated.move1.name,
                                description: generated.move1.description,
                                damageAmount: generated.move1.damageAmount || 0,
                                damageModifier: generated.move1.damageModifier || undefined,
                                energyCost: generated.move1.energyCost || [],
                            }
                            : { name: '', description: '', damageAmount: 0, energyCost: [] },
                        hasMove2: !!generated?.hasMove2 && !!generated?.move2,
                        move2:
                            !!generated?.hasMove2 && generated.move2
                                ? {
                                    name: generated.move2.name,
                                    description: generated.move2.description,
                                    damageAmount: generated.move2.damageAmount || 0,
                                    damageModifier: generated.move2.damageModifier || undefined,
                                    energyCost: generated.move2.energyCost || [],
                                }
                                : {
                                    name: '',
                                    description: '',
                                    damageAmount: 0,
                                    energyCost: [],
                                },
                        baseSetId: 1, // Sword & Shield
                        supertypeId: generated.supertypeId || 1,
                        typeId: generated.typeId || 11,
                        subtypeId: generated.subtypeId || undefined,
                        rarityId: generated.rarityId || undefined,
                        variationId: generated.variationId || undefined,
                        weaknessTypeId: generated.weaknessTypeId || undefined,
                        resistanceTypeId: generated.resistanceTypeId || undefined,
                        setIconId: 1,
                        typeImgId: generated.typeId || 11,
                        rotationIconId: 1,
                        rarityIconId: generated.rarityId || 1,
                        weaknessAmount: 1,
                        resistanceAmount: 1,
                        prevolveName: '',
                        prevolveImgSrc: '',
                        customSetIconSrc: '',
                        customTypeImgSrc: '',
                        typeImgAmount: 1,
                        imgLayer1: undefined,
                        imgLayer2: undefined,
                    } as CardInterface),
            };
        },
        [],
    );

    useEffect(() => {
        if (lastCard) {
            // Update card in database if it was created
            if (lastCard.createdCardId && lastCard.card) {
                setTimeout(async () => {
                    try {
                        const cardData = createCardDataFromGenerated(
                            lastCard.card,
                            lastCard.imageUrl,
                            lastCard.createdCardId,
                            lastCard.cardEditorState,
                        );
                        await fetch(`/api/cards/${lastCard.createdCardId}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                cardEditorState: cardData.cardEditorState,
                            }),
                        });
                    } catch (e) {
                        console.error('Failed to update card state:', e);
                    }
                }, 1500);
            }
        }
    }, [lastCard, createCardDataFromGenerated]);

    return (
        <>
            <SEO
                title={`Booster Pack — ${pack.name}`}
                description="Open a virtual booster pack and generate cards sequentially with AI"
            />
            {/* Top banner outside the main booster component to avoid layout shift */}
            <Box sx={{ mb: 3 }}>
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        background: pack.gradient,
                        color: 'white',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                        minHeight: 96,
                    }}
                >
                    {drop ? (
                        <Stack spacing={1.25}>
                            <Stack
                                direction="row"
                                spacing={1.25}
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Stack spacing={0.25}>
                                    <Typography
                                        variant="overline"
                                        sx={{ opacity: 0.9, letterSpacing: 1.5 }}
                                    >
                                        Limited Drop
                                    </Typography>
                                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                        {drop.name || 'Special Release'}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                        size="small"
                                        label={`Cost: ${drop.creditCost ?? 38} credits`}
                                        sx={{
                                            bgcolor: 'rgba(255,255,255,0.15)',
                                            color: 'white',
                                            border: '1px solid rgba(255,255,255,0.35)',
                                        }}
                                    />
                                    {/* Scheduling removed */}
                                    {drop.status === 'active' && (
                                        <Chip
                                            size="small"
                                            label={`${drop.opensLastHour ?? 0} opened in last hour`}
                                            sx={{
                                                bgcolor: 'rgba(255,255,255,0.2)',
                                                color: 'white',
                                                border: '1px solid rgba(255,255,255,0.4)',
                                            }}
                                        />
                                    )}
                                    {/* user credits intentionally not shown in banner */}
                                    {true && (
                                        <Chip
                                            size="small"
                                            label={drop.status === 'active' ? 'Active' : 'Inactive'}
                                            color={drop.status === 'active' ? 'success' : 'warning'}
                                        />
                                    )}
                                </Stack>
                            </Stack>
                            {drop.status === 'active' && (
                                <Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={Math.max(
                                            0,
                                            Math.min(
                                                100,
                                                Math.round(
                                                    Math.min(100, (drop.opensLastHour ?? 0) * 3),
                                                ),
                                            ),
                                        )}
                                        sx={{
                                            height: 10,
                                            borderRadius: 5,
                                            bgcolor: 'rgba(255,255,255,0.25)',
                                            '& .MuiLinearProgress-bar': {
                                                background: 'linear-gradient(90deg, #42a5f5, #1e88e5)',
                                            },
                                        }}
                                    />
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        sx={{ mt: 0.75 }}
                                    >
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            {drop.opensLast24h ?? 0} opened in 24h
                                        </Typography>
                                        <Typography variant="caption" sx={{ opacity: 0.9 }}>
                                            {drop.opensLastHour ?? 0} in last hour
                                        </Typography>
                                    </Stack>
                                </Box>
                            )}
                        </Stack>
                    ) : (
                        <Skeleton
                            variant="rounded"
                            height={64}
                            sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}
                        />
                    )}
                </Box>
            </Box>
            <Grid container spacing={3} alignItems="stretch">
                <Grid item xs={12}>
                    <MuiCard sx={{ height: '100%' }}>
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                justifyContent="space-between"
                                sx={{ mb: 2 }}
                            >
                                <Typography variant="h5">Booster Pack Opening</Typography>
                                <Stack direction="row" spacing={1}>
                                    <Button component={Link} to="/" variant="text">
                                        All Packs
                                    </Button>
                                    <Button component={Link} to={typeof Routes.Gallery === 'string' ? Routes.Gallery : '/gallery'} variant="text">
                                        My Collection
                                    </Button>
                                </Stack>
                            </Stack>

                            {/* Sequential Pack Opening */}
                            <Box sx={{ px: { xs: 2, md: 6 } }}>
                                <SequentialPackOpening
                                    packSlug={pack.slug}
                                    onComplete={() => {
                                        // Handle completion if needed
                                    }}
                                />
                            </Box>
                        </CardContent>
                    </MuiCard>
                </Grid>
            </Grid>
        </>
    );
};

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

export default BoosterPack;

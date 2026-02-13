export type BoosterSlot = 'common' | 'uncommon' | 'rare';

export type GeneratedMove = {
    name: string;
    description: string;
    damageAmount?: number;
    damageModifier?: '×' | '+' | null;
    energyCost?: Array<{ amount: number; typeId: number }>;
};

export type GeneratedCard = {
    name?: string;
    subname?: string | null;
    hitpoints?: number;
    supertypeId?: number;
    typeId?: number;
    subtypeId?: number | null;
    variationId?: number | null;
    rarityId?: number | null;
    weaknessTypeId?: number | null;
    resistanceTypeId?: number | null;
    retreatCost?: number | null;
    illustrator?: string | null;
    cardNumber?: string;
    totalInSet?: string;
    dexStats?: string;

    description?: string | null;
    hasAbility?: boolean;
    ability?: GeneratedMove | null;
    move1?: GeneratedMove | null;
    hasMove2?: boolean;
    move2?: GeneratedMove | null;
};

export type BoosterJobResponse = {
    jobId: string;
};

export type JobStatusResponse = {
    status: 'pending' | 'processing' | 'complete' | 'failed';
    card?: {
        rarity: BoosterSlot;
        pokemonName: string;
        card: GeneratedCard;
        imageUrl: string | null;
        images?: string[];
        createdCardId: number;
        cardEditorState?: any;
    };
    error?: string;
};

export interface CardData {
    id: number;
    name: string;
    type: string;
    supertype: string;
    rarity: string;
    hitpoints?: number;
    illustrator?: string;
    description?: string;
    dexStats?: string;

    moves?: any;
    ability?: any;
    retreatCost?: number;
    weakness?: any;
    resistance?: any;
    imageData?: any;
    cardEditorState?: any;
    raritySlot?: string;
}

export type UseBoosterOpeningResult = {
    drawing: boolean;
    error: string | null;
    loadingPhase: 'idle' | 'queued' | 'generating' | 'ready';
    dynamicMessage: string;
    lastCard: JobStatusResponse['card'] | null;
    openSingle: (packSlug?: string) => void;
    isBusy: boolean;
    queuePosition?: number;
    estimatedWaitTime?: number;
    drop: {
        status: 'inactive' | 'active';
        name?: string;
        opensLastHour?: number;
        opensLast24h?: number;
        credits?: number;
        creditCost?: number;
        startsAt?: string | null;
    } | null;
    refreshDrop: () => Promise<void>;
};

export interface PackOpeningState {
    isOpening: boolean;
    isRevealing: boolean;
    currentCardIndex: number;
    totalCards: number;
    revealedCards: CardData[];
    allCardIds: number[];
    packSlug: string | null;
    error: string | null;
    creditsRemaining?: number;
}

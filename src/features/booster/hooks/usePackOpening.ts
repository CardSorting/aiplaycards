import { useCallback, useState } from 'react';
import { useSession } from '@hooks/useSession';
import { CardData, PackOpeningState } from '../types';

export function usePackOpening() {
    const { data: session } = useSession();
    const [state, setState] = useState<PackOpeningState>({
        isOpening: false,
        isRevealing: false,
        currentCardIndex: 0,
        totalCards: 0,
        revealedCards: [],
        allCardIds: [],
        packSlug: null,
        error: null,
    });

    // Function to reveal a specific card by ID
    const revealCard = useCallback(async (cardId: number) => {
        try {
            // Fetch card details
            const response = await fetch(`/api/cards/${cardId}`);
            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch card details');
            }

            if (!result.success || !result.data) {
                throw new Error('Invalid API response format');
            }

            const cardData: CardData = result.data;

            setState(prev => ({
                ...prev,
                revealedCards: [...prev.revealedCards, cardData],
                currentCardIndex: prev.currentCardIndex + 1,
                isRevealing: false, // Stop revealing after card is shown
            }));
        } catch (error) {
            console.error('Failed to reveal card:', error);
            setState(prev => ({
                ...prev,
                error: 'Failed to reveal card',
                isRevealing: false,
            }));
        }
    }, []);

    const openPack = useCallback(
        async (packSlug: string) => {
            if (!session?.user) {
                setState(prev => ({ ...prev, error: 'Please sign in to open packs' }));
                return;
            }

            setState(prev => ({
                ...prev,
                isOpening: true,
                error: null,
                packSlug,
                currentCardIndex: 0,
                revealedCards: [],
                allCardIds: [],
            }));

            try {
                // Open the entire pack (draw 5 cards)
                const response = await fetch('/api/booster-pack-open', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ packSlug }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.error || 'Failed to open pack');
                }

                // Store all card IDs and automatically reveal the single card
                setState(prev => ({
                    ...prev,
                    isOpening: false,
                    isRevealing: true,
                    allCardIds: data.cardIds,
                    totalCards: data.totalCards,
                    currentCardIndex: 0,
                    revealedCards: [],
                }));

                // For single card packs, automatically reveal the card
                if (data.cardIds.length === 1) {
                    // Small delay to show the opening animation
                    setTimeout(() => {
                        revealCard(data.cardIds[0]);
                    }, 500);
                }
            } catch (error) {
                console.error('Failed to open pack:', error);
                setState(prev => ({
                    ...prev,
                    isOpening: false,
                    error: error instanceof Error ? error.message : 'Failed to open pack',
                }));
            }
        },
        [session?.user, revealCard],
    );

    const revealNextCard = useCallback(async () => {
        if (state.currentCardIndex >= state.allCardIds.length) {
            return; // No more cards to reveal
        }

        const cardId = state.allCardIds[state.currentCardIndex];
        await revealCard(cardId);
    }, [state.allCardIds, state.currentCardIndex, revealCard]);

    const resetPack = useCallback(() => {
        setState({
            isOpening: false,
            isRevealing: false,
            currentCardIndex: 0,
            totalCards: 0,
            revealedCards: [],
            allCardIds: [],
            packSlug: null,
            error: null,
        });
    }, []);

    const getCurrentCard = useCallback(() => {
        const lastRevealedIndex = state.revealedCards.length - 1;
        return lastRevealedIndex >= 0
            ? state.revealedCards[lastRevealedIndex]
            : null;
    }, [state.revealedCards]);

    const hasMoreCards = state.currentCardIndex < state.allCardIds.length;
    const isPackComplete =
        state.currentCardIndex >= state.allCardIds.length &&
        state.allCardIds.length > 0;

    return {
        ...state,
        openPack,
        revealNextCard,
        resetPack,
        getCurrentCard,
        hasMoreCards,
        isPackComplete,
        progress:
            state.allCardIds.length > 0
                ? state.currentCardIndex / state.allCardIds.length
                : 0,
    };
}

import { useCallback, useState } from 'react';
import { MTGCard } from '../types';

interface SaveCardResult {
  success: boolean;
  card?: any;
  error?: string;
}

export function useSaveCard() {
  const [isSaving, setIsSaving] = useState(false);

  const saveCard = useCallback(
    async (
      cardData: MTGCard,
      renderedImageUrl?: string,
    ): Promise<SaveCardResult> => {
      if (!cardData) {
        return { success: false, error: 'Card data is required' };
      }

      try {
        setIsSaving(true);

        // Frontend validation before submission
        const validation = validateMTGCard(cardData);
        if (!validation.isValid) {
          const errorMessage = `Validation failed:\n${validation.errors.join(
            '\n',
          )}`;
          return { success: false, error: errorMessage };
        }

        // Save to database
        const response = await fetch('/api/mtg-cards', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cardData,
            renderedImageUrl,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          return {
            success: false,
            error: error.error || 'Failed to save card',
          };
        }

        const result = await response.json();

        return {
          success: true,
          card: result.card,
        };
      } catch (error) {
        console.error('Error saving MTG card:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      } finally {
        setIsSaving(false);
      }
    },
    [],
  );

  return {
    saveCard,
    isSaving,
  };
}

/**
 * Validate MTG card data on frontend
 */
function validateMTGCard(cardData: MTGCard): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate required fields
  if (!cardData.name || cardData.name.trim().length < 2) {
    errors.push('Card name must be at least 2 characters long');
  }

  if (!cardData.type || cardData.type.trim().length < 3) {
    errors.push('Card type is required and must be at least 3 characters');
  }

  // Validate creature-specific fields
  if (cardData.type.toLowerCase().includes('creature')) {
    if (!cardData.power && cardData.power !== '0') {
      errors.push('Creatures must have power');
    }
    if (!cardData.toughness && cardData.toughness !== '0') {
      errors.push('Creatures must have toughness');
    }
  }

  // Validate planeswalker-specific fields
  if (cardData.type.toLowerCase().includes('planeswalker')) {
    if (!cardData.loyalty) {
      errors.push('Planeswalkers must have starting loyalty');
    }
  }

  // Validate rarity
  if (!['common', 'uncommon', 'rare', 'mythic'].includes(cardData.rarity)) {
    errors.push('Invalid rarity specified');
  }

  // Validate text lengths
  if (cardData.text && cardData.text.length > 1000) {
    errors.push('Card text must be 1000 characters or less');
  }

  if (cardData.flavorText && cardData.flavorText.length > 500) {
    errors.push('Flavor text must be 500 characters or less');
  }

  if (cardData.name && cardData.name.length > 100) {
    errors.push('Card name must be 100 characters or less');
  }

  return { isValid: errors.length === 0, errors };
}

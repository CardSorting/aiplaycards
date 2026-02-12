'use client';

import { useCallback, useRef, useState } from 'react';
import { YugiohCardCanvasRef } from '../components/YugiohCardCanvas';
import { YugiohCardData } from '../types';
import { useYugiohCardData } from './useYugiohCardData';
import { useYugiohCardUI } from './useYugiohCardUI';
import { useYugiohCardMeta } from './useYugiohCardMeta';
import { useYugiohCardYgoPro } from './useYugiohCardYgoPro';

/**
 * Validate Yu-Gi-Oh card data for spam prevention and quality
 */
function validateYugiohCardData(cardData: YugiohCardData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validate card title
  if (!cardData.cardTitle || cardData.cardTitle.trim().length < 2) {
    errors.push('Card title must be at least 2 characters long');
  }
  if (cardData.cardTitle && cardData.cardTitle.length > 100) {
    errors.push('Card title must be 100 characters or less');
  }

  // Check for spam patterns in title
  if (cardData.cardTitle) {
    const title = cardData.cardTitle.trim();

    // Check for repetitive characters (spam pattern)
    if (/(.)\1{4,}/.test(title)) {
      errors.push('Card title contains too many repeated characters');
    }

    // Check for suspicious patterns
    const suspiciousPatterns = [
      /^[a-z]+$/i, // All letters (too generic)
      /^[0-9]+$/, // All numbers
      /^(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc)+$/i, // Common spam words
    ];

    if (suspiciousPatterns.some(pattern => pattern.test(title))) {
      errors.push('Card title appears to be a test or spam entry');
    }
  }

  // Validate card type
  if (
    !cardData.cardType ||
    !['Monster', 'Spell', 'Trap'].includes(cardData.cardType)
  ) {
    errors.push('Valid card type is required (Monster, Spell, or Trap)');
  }

  // Validate card info/description
  if (cardData.cardInfo) {
    if (cardData.cardInfo.length < 10) {
      errors.push('Card description must be at least 10 characters long');
    }
    if (cardData.cardInfo.length > 2000) {
      errors.push('Card description must be 2000 characters or less');
    }

    // Check for repetitive content
    const words = cardData.cardInfo.trim().split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const uniqueRatio = words.length > 0 ? uniqueWords.size / words.length : 1;

    if (words.length > 20 && uniqueRatio < 0.4) {
      errors.push('Card description appears to contain repetitive words');
    }

    // Check for spam keywords in description
    const spamKeywords = [
      'test',
      'spam',
      'fake',
      'dummy',
      'temp',
      'tmp',
      'asdf',
      'qwerty',
      '123',
      'abc',
    ];
    const contentLower = cardData.cardInfo.toLowerCase();
    const foundSpamKeywords = spamKeywords.filter(keyword =>
      contentLower.includes(keyword),
    );

    if (foundSpamKeywords.length >= 2) {
      errors.push(
        `Description contains spam keywords: ${foundSpamKeywords.join(', ')}`,
      );
    }
  }

  // Validate monster-specific fields
  if (cardData.cardType === 'Monster') {
    // Validate ATK/DEF values
    if (cardData.cardATK !== undefined && cardData.cardATK !== null) {
      const atk = parseInt(cardData.cardATK.toString());
      if (isNaN(atk) || atk < 0 || atk > 9999) {
        errors.push('ATK value must be between 0 and 9999');
      }
    }

    if (cardData.cardDEF !== undefined && cardData.cardDEF !== null) {
      const def = parseInt(cardData.cardDEF.toString());
      if (isNaN(def) || def < 0 || def > 9999) {
        errors.push('DEF value must be between 0 and 9999');
      }
    }

    // Validate level
    if (cardData.cardLevel !== undefined && cardData.cardLevel !== null) {
      const level = parseInt(cardData.cardLevel.toString());
      if (isNaN(level) || level < 1 || level > 12) {
        errors.push('Level must be between 1 and 12');
      }
    }

    // Validate pendulum properties
    if (cardData.Pendulum) {
      if (cardData.cardBLUE !== undefined && cardData.cardBLUE !== null) {
        const blue = parseInt(cardData.cardBLUE.toString());
        if (isNaN(blue) || blue < 1 || blue > 13) {
          errors.push('Pendulum scale (Blue) must be between 1 and 13');
        }
      }

      if (cardData.cardRED !== undefined && cardData.cardRED !== null) {
        const red = parseInt(cardData.cardRED.toString());
        if (isNaN(red) || red < 1 || red > 13) {
          errors.push('Pendulum scale (Red) must be between 1 and 13');
        }
      }
    }

    // Validate custom race
    if (cardData.cardCustomRaceEnabled && cardData.cardCustomRace) {
      if (cardData.cardCustomRace.length < 2) {
        errors.push('Custom race must be at least 2 characters long');
      }
      if (cardData.cardCustomRace.length > 50) {
        errors.push('Custom race must be 50 characters or less');
      }

      // Check for spam patterns in custom race
      const customRace = cardData.cardCustomRace.trim();
      if (/(.)\1{4,}/.test(customRace)) {
        errors.push('Custom race contains too many repeated characters');
      }

      const spamKeywords = [
        'test',
        'spam',
        'fake',
        'dummy',
        'temp',
        'tmp',
        'asdf',
        'qwerty',
        '123',
        'abc',
      ];
      if (
        spamKeywords.some(keyword => customRace.toLowerCase().includes(keyword))
      ) {
        errors.push('Custom race contains spam keywords');
      }
    }
  }

  // Validate pendulum info
  if (cardData.Pendulum && cardData.cardPendulumInfo) {
    if (cardData.cardPendulumInfo.length < 5) {
      errors.push('Pendulum effect must be at least 5 characters long');
    }
    if (cardData.cardPendulumInfo.length > 500) {
      errors.push('Pendulum effect must be 500 characters or less');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export const useYugiohCardEditor = () => {
  const canvasRef = useRef<YugiohCardCanvasRef>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { cardData, updateCardData } = useYugiohCardData();

  const { ui, cardMeta, loadLanguageData, loadDefaultData } =
    useYugiohCardMeta();

  const { ygoproData, loadYgoProData } = useYugiohCardYgoPro();

  const { downloadCard } = useYugiohCardUI(canvasRef);

  const saveCard = useCallback(async () => {
    if (!canvasRef.current) {
      throw new Error('Card canvas not ready');
    }

    try {
      // Frontend validation before submission
      const validation = validateYugiohCardData(cardData);
      if (!validation.isValid) {
        const errorMessage = `Validation failed:\n${validation.errors.join(
          '\n',
        )}`;
        throw new Error(errorMessage);
      }

      setIsLoading(true);

      // Get the canvas image data
      const canvas = canvasRef.current;
      const imageDataUrl = canvas.toDataURL('image/png');

      // Save to database
      const response = await fetch('/api/yugioh-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cardData,
          imageDataUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save card');
      }

      const result = await response.json();

      return {
        success: true,
        card: result.card,
      };
    } catch (error) {
      console.error('Error saving card:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [cardData]);

  return {
    cardData,
    updateCardData,
    ui,
    cardMeta,
    ygoproData,
    isLoading,
    setIsLoading,
    canvasRef,
    loadLanguageData,
    loadDefaultData,
    loadYgoProData,
    downloadCard,
    saveCard,
  };
};

'use client';

import { useCallback } from 'react';
import { validateContent } from '../../../utils/spam-prevention/content-validation';
import { defaultSpamConfig } from '../../../config/spam-prevention';
import type { ContentValidationResult } from '../../../types/spam-prevention';
import { MTGCard } from '../types';

// MTG-specific spam prevention configuration
const mtgSpamConfig = {
  ...defaultSpamConfig,
  minContentLength: 3, // Card names can be short
  maxContentLength: 2000, // Total content limit
  maxRepetitiveCharacters: 3,
  maxRepetitiveWords: 2,
  spamKeywords: [
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
    'word',
    'text',
    'description',
    'sample',
    'example',
    'placeholder',
    'xxx',
    'testing',
    'lorem',
    'ipsum',
  ],
  // MTG-specific suspicious patterns
  suspiciousPatterns: [
    /(.)\1{3,}/, // 4+ repeated characters
    /(test|spam|fake|dummy|temp|tmp|asdf|qwerty|123|abc){2,}/i, // Repeated spam words
    /^[a-z]+$/i, // All letters (too generic for card names)
    /^[0-9]+$/, // All numbers
    /^.{1,2}$/, // Too short for meaningful content
  ],
  enableProfanityFilter: true,
  profanityAction: 'block' as const,
  profanityThreshold: 0,
};

interface MTGContentValidation {
  validateCardName: (name: string) => ContentValidationResult;
  validateCardText: (text: string) => ContentValidationResult;
  validateFlavorText: (text: string) => ContentValidationResult;
  validateArtist: (artist: string) => ContentValidationResult;
  validateFullCard: (card: MTGCard) => {
    isValid: boolean;
    errors: Record<string, string[]>;
    hasBlockingErrors: boolean;
  };
  getContentQuality: (content: string) => number;
}

export function useContentValidation(userId?: string): MTGContentValidation {
  const validateCardName = useCallback(
    (name: string): ContentValidationResult => {
      if (!name.trim()) {
        return { isValid: false, errors: ['Card name is required'] };
      }

      return validateContent(
        name,
        {
          ...mtgSpamConfig,
          minContentLength: 1, // Names can be very short
          maxContentLength: 50, // Card names shouldn't be too long
        },
        userId,
      );
    },
    [userId],
  );

  const validateCardText = useCallback(
    (text: string): ContentValidationResult => {
      if (!text.trim()) {
        return { isValid: true, errors: [] }; // Rules text is optional
      }

      return validateContent(
        text,
        {
          ...mtgSpamConfig,
          minContentLength: 3, // Short abilities are ok
          maxContentLength: 800, // Rules text can be long
        },
        userId,
      );
    },
    [userId],
  );

  const validateFlavorText = useCallback(
    (text: string): ContentValidationResult => {
      if (!text.trim()) {
        return { isValid: true, errors: [] }; // Flavor text is optional
      }

      return validateContent(
        text,
        {
          ...mtgSpamConfig,
          minContentLength: 3, // Short flavor text is ok
          maxContentLength: 300, // Flavor text should be concise
        },
        userId,
      );
    },
    [userId],
  );

  const validateArtist = useCallback(
    (artist: string): ContentValidationResult => {
      if (!artist.trim()) {
        return { isValid: true, errors: [] }; // Artist is optional
      }

      return validateContent(
        artist,
        {
          ...mtgSpamConfig,
          minContentLength: 2,
          maxContentLength: 100,
          enableProfanityFilter: false, // Artist names shouldn't be filtered for profanity
        },
        userId,
      );
    },
    [userId],
  );

  const validateFullCard = useCallback(
    (card: MTGCard) => {
      const errors: Record<string, string[]> = {};
      let hasBlockingErrors = false;

      // Validate card name (required)
      const nameValidation = validateCardName(card.name);
      if (!nameValidation.isValid) {
        errors.name = nameValidation.errors;
        hasBlockingErrors = true;
      }

      // Validate rules text
      if (card.text) {
        const textValidation = validateCardText(card.text);
        if (!textValidation.isValid) {
          errors.text = textValidation.errors;
          // Check for blocking profanity
          if (
            textValidation.profanityCheck?.hasProfanity &&
            textValidation.profanityCheck?.action === 'block'
          ) {
            hasBlockingErrors = true;
          }
        }
      }

      // Validate flavor text
      if (card.flavorText) {
        const flavorValidation = validateFlavorText(card.flavorText);
        if (!flavorValidation.isValid) {
          errors.flavorText = flavorValidation.errors;
          // Check for blocking profanity
          if (
            flavorValidation.profanityCheck?.hasProfanity &&
            flavorValidation.profanityCheck?.action === 'block'
          ) {
            hasBlockingErrors = true;
          }
        }
      }

      // Validate artist
      if (card.artist) {
        const artistValidation = validateArtist(card.artist);
        if (!artistValidation.isValid) {
          errors.artist = artistValidation.errors;
        }
      }

      // Check for MTG-specific validation rules
      if (card.type) {
        if (card.type.toLowerCase().includes('creature')) {
          if (!card.power || !card.toughness) {
            if (!errors.type) errors.type = [];
            errors.type.push('Creatures must have power and toughness');
          }
        }

        if (card.type.toLowerCase().includes('planeswalker')) {
          if (!card.loyalty) {
            if (!errors.type) errors.type = [];
            errors.type.push('Planeswalkers must have starting loyalty');
          }
        }
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        hasBlockingErrors,
      };
    },
    [validateCardName, validateCardText, validateFlavorText, validateArtist],
  );

  const getContentQuality = useCallback(
    (content: string): number => {
      const validation = validateContent(content, mtgSpamConfig, userId);
      return validation.qualityScore || 0;
    },
    [userId],
  );

  return {
    validateCardName,
    validateCardText,
    validateFlavorText,
    validateArtist,
    validateFullCard,
    getContentQuality,
  };
}

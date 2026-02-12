'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CardDisplayWrapperProps } from './types';
import CardDisplay from '@cardEditor/cardStyles/components/CardDisplay';
import { CardOptionsProvider } from '@cardEditor/cardOptions';
import { CardStylesProvider } from '@cardEditor/cardStyles/Context';
import { generateCardState, getResponsiveCardWidths } from './utils';

/**
 * Reusable card display wrapper that handles card state generation and providers for regular Pokemon cards
 */
export const CardDisplayWrapper = ({
  card,
  showFrame = true,
  disableParallax = false,
  width = 'responsive',
  height: _height, // Not used - CardDisplay calculates its own height
  aspectRatio: _aspectRatio, // Not used - CardDisplay uses cardImgAspect internally
  className,
  children,
  fallbackContent,
}: CardDisplayWrapperProps) => {
  // Generate card state from the card data
  const cardState = React.useMemo(() => generateCardState(card), [card]);

  // Calculate responsive width - handle different width options
  const resolvedWidth = React.useMemo(() => {
    if (typeof width === 'number') return `${width}px`;
    if (typeof width === 'object') {
      // Handle ResponsiveWidth object - convert to CSS responsive behavior
      return '100%'; // Let the container handle responsive sizing
    }
    if (typeof width === 'string') {
      // Handle preset width options
      if (width === 'responsive' || width === 'fluid') return '100%';
      if (width === 'constrained') return '100%';
      // Check if it's a predefined width key
      const predefinedWidths = getResponsiveCardWidths as any;
      if (predefinedWidths[width]) {
        if (typeof predefinedWidths[width] === 'string') {
          return predefinedWidths[width] === 'responsive'
            ? '100%'
            : predefinedWidths[width];
        }
        return '100%'; // For responsive width objects
      }
      return width; // Return as-is for custom CSS values
    }
    return '100%';
  }, [width]);

  // Handle null cardState gracefully
  if (!cardState) {
    return (
      fallbackContent || (
        <Box
          className={className}
          sx={{
            width: resolvedWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '747/1038', // Use card's natural aspect ratio
            backgroundColor: '#f0f0f0',
            borderRadius: 2,
            color: '#666',
            fontSize: '0.875rem',
          }}
        >
          Loading Card...
        </Box>
      )
    );
  }

  const cardBox = (
    <Box
      className={className}
      sx={{
        width: resolvedWidth,
        // Let CardDisplay handle its own sizing completely
        // The CardDisplay component will set its own height based on width
        position: 'relative',
      }}
    >
      <CardOptionsProvider
        key={`${card.id}-${cardState.rarityId}-${cardState.typeId}`}
        initialState={cardState}
      >
        <CardStylesProvider>
          <CardDisplay
            showFrame={showFrame}
            disableParallax={disableParallax}
          />
        </CardStylesProvider>
      </CardOptionsProvider>
    </Box>
  );

  // If children provided, render them alongside the card
  if (children) {
    return (
      <>
        {cardBox}
        {children}
      </>
    );
  }

  return cardBox;
};

export default CardDisplayWrapper;

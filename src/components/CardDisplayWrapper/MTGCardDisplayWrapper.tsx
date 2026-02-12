'use client';

import React from 'react';
import { Box } from '@mui/material';
import { CardDisplayWrapperProps, MTGCardData } from './types';
import { MTGCardFrame } from '../../features/mtgCardEditor/components/preview/MTGCardFrame';
import { generateMTGCardState, getResponsiveCardWidths } from './utils';

/**
 * Reusable card display wrapper that handles card state generation for MTG cards
 */
export const MTGCardDisplayWrapper = ({
  card,
  showFrame: _showFrame = true,
  disableParallax: _disableParallax = false,
  width = 'responsive',
  height: _height, // Not used - MTGCardFrame calculates its own height
  aspectRatio: _aspectRatio, // Not used - MTGCardFrame uses cardImgAspect internally
  className,
  children,
  fallbackContent,
}: CardDisplayWrapperProps) => {
  // Generate MTG card state from the card data
  const mtgCardState = React.useMemo(() => {
    // Convert CardData to MTGCardData format
    const mtgCardData: MTGCardData = {
      id: card.id,
      name: card.name,
      manaCost: (card.cardEditorState as any)?.manaCost as string,
      type: card.type,
      rarity:
        (card.rarity as 'common' | 'uncommon' | 'rare' | 'mythic') || 'common',
      set: 'Custom', // Default set
      text: card.description,
      imageUrl: card.imageData?.dataUrl,
      layout: 'normal',
      colors: [],
      colorIdentity: [],
      isPublic: card.isPublic,
      createdAt: card.createdAt,
      userId: (card as any).userId as string,
      cardEditorState: card.cardEditorState,
      imageData: card.imageData,
      animationUrl: card.animationUrl,
      animationKey: card.animationKey,
      animationPrompt: card.animationPrompt,
      animatedAt: card.animatedAt,
      priceUsd: card.priceUsd,
      priceCredits: card.priceCredits,
      status: card.status,
      sellerUserId: card.sellerUserId,
      buyerUserId: card.buyerUserId,
      soldAt: card.soldAt,
    };

    return generateMTGCardState(mtgCardData);
  }, [card]);

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
  if (!mtgCardState) {
    return (
      fallbackContent || (
        <Box
          className={className}
          sx={{
            width: resolvedWidth,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '5/7', // Use MTG card's natural aspect ratio (2.5" x 3.5")
            backgroundColor: '#f0f0f0',
            borderRadius: 2,
            color: '#666',
            fontSize: '0.875rem',
          }}
        >
          Loading MTG Card...
        </Box>
      )
    );
  }

  const cardBox = (
    <Box
      className={className}
      sx={{
        width: resolvedWidth,
        // Let MTGCardFrame handle its own sizing completely
        // The MTGCardFrame component will set its own height based on width
        position: 'relative',
      }}
    >
      <MTGCardFrame card={mtgCardState} />
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

export default MTGCardDisplayWrapper;

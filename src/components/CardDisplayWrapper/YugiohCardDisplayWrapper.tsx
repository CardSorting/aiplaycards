'use client';

import React from 'react';
import { Box } from '@mui/material';
import { useYugiohCardEditor } from '@features/yugiohEditor/hooks/useYugiohCardEditor';
import YugiohCardCanvas from '@features/yugiohEditor/components/YugiohCardCanvas';
import { YugiohCardData } from '@features/yugiohEditor/types';

export interface YugiohCardDisplayWrapperProps {
  cardData?: Partial<YugiohCardData>;
  showFrame?: boolean;
  width?: number | string;
  height?: number | string;
  aspectRatio?: string;
  className?: string;
  children?: React.ReactNode;
  fallbackContent?: React.ReactNode;
  onCardDataChange?: (cardData: YugiohCardData) => void;
}

/**
 * Reusable card display wrapper that handles card state generation and providers specifically for the card data of yugiohEditor
 */
export const YugiohCardDisplayWrapper = ({
  cardData: initialCardData,
  showFrame = true,
  width = '100%',
  height = 'auto',
  aspectRatio = '4/3',
  className,
  children,
  fallbackContent,
  onCardDataChange,
}: YugiohCardDisplayWrapperProps) => {
  const {
    cardData,
    updateCardData,
    cardMeta,
    isLoading,
    canvasRef,
    loadLanguageData,
  } = useYugiohCardEditor();

  // Initialize card data if provided
  React.useEffect(() => {
    if (initialCardData) {
      updateCardData(initialCardData);
    }
  }, [initialCardData, updateCardData]);

  // Notify parent of card data changes
  React.useEffect(() => {
    if (onCardDataChange) {
      onCardDataChange(cardData);
    }
  }, [cardData, onCardDataChange]);

  // Load language data on mount
  React.useEffect(() => {
    loadLanguageData();
  }, [loadLanguageData]);

  const getSxStyles = () => {
    const baseStyles = {
      aspectRatio: height === 'auto' ? aspectRatio : 'auto',
      width,
      height,
      position: 'relative',
      minWidth: 0,
      flexShrink: 1,
      overflow: 'hidden',
    } as const;

    if (typeof width === 'string' && width.includes('%')) {
      return {
        ...baseStyles,
        maxWidth: '100%',
      };
    }

    return baseStyles;
  };

  const cardBox = (
    <Box className={className} sx={getSxStyles()}>
      {!isLoading ? (
        <Box
          sx={{
            width: '100%',
            height: '100%',
            border: showFrame ? '1px solid #ddd' : 'none',
            borderRadius: showFrame ? '8px' : '0',
          }}
        >
          <YugiohCardCanvas
            ref={canvasRef}
            cardData={cardData}
            cardMeta={cardMeta}
            onLoadingChange={() => {
              // Loading change handler - currently no-op
            }}
          />
        </Box>
      ) : (
        fallbackContent || (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f0f0',
              borderRadius: 2,
              color: '#666',
              fontSize: '0.875rem',
            }}
          >
            Loading Card Preview...
          </Box>
        )
      )}
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

export default YugiohCardDisplayWrapper;

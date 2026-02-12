'use client';

import { useCallback } from 'react';
import { YugiohCardCanvasRef } from '../components/YugiohCardCanvas';

export const useYugiohCardUI = (
  _canvasRef: React.RefObject<YugiohCardCanvasRef>,
) => {
  const downloadCard = useCallback(() => {
    // Stub implementation
  }, []);

  return {
    downloadCard,
  };
};

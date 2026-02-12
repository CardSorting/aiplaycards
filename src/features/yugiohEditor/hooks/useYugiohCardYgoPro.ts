'use client';

import { useCallback, useState } from 'react';

export const useYugiohCardYgoPro = () => {
  const [ygoproData, _setYgoproData] = useState(null);

  const loadYgoProData = useCallback((cardKey: string) => {
    // Stub implementation
  }, []);

  return {
    ygoproData,
    loadYgoProData,
  };
};

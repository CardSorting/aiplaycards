'use client';

import { useCallback, useEffect, useState } from 'react';

export const useYugiohCardMeta = () => {
  const [ui, setUi] = useState<Record<string, any>>({});
  const [cardMeta, setCardMeta] = useState<Record<string, any>>({});

  useEffect(() => {
    // Stub implementation - load basic metadata
    setUi({ en: {} });
    setCardMeta({});
  }, []);

  const loadLanguageData = useCallback(() => {
    // Stub implementation
  }, []);

  const loadDefaultData = useCallback(() => {
    // Stub implementation
  }, []);

  return {
    ui,
    cardMeta,
    loadLanguageData,
    loadDefaultData,
  };
};

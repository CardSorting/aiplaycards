import { useCallback, useState } from 'react';

/**
 * Hook for managing card loading state across multiple cards
 * Useful for lazy loading optimization
 */
export const useCardLoadingState = () => {
  const [cardsLoaded, setCardsLoaded] = useState<Set<number>>(new Set());

  const handleCardLoad = useCallback((cardId: number) => {
    setCardsLoaded(prev => new Set(prev).add(cardId));
  }, []);

  const isCardLoaded = useCallback(
    (cardId: number) => {
      return cardsLoaded.has(cardId);
    },
    [cardsLoaded],
  );

  const resetLoadingState = useCallback(() => {
    setCardsLoaded(new Set());
  }, []);

  return {
    cardsLoaded,
    handleCardLoad,
    isCardLoaded,
    resetLoadingState,
  };
};

/**
 * Hook for managing pagination state
 * Provides consistent pagination logic across different pages
 */
export const usePagination = (itemsPerPage = 24) => {
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const totalPages = Math.ceil(total / itemsPerPage);
  const offset = (page - 1) * itemsPerPage;

  const resetPage = useCallback(() => {
    setPage(1);
  }, []);

  const goToPage = useCallback(
    (newPage: number) => {
      setPage(Math.max(1, Math.min(newPage, totalPages)));
    },
    [totalPages],
  );

  return {
    page,
    setPage,
    total,
    setTotal,
    totalPages,
    offset,
    itemsPerPage,
    resetPage,
    goToPage,
  };
};

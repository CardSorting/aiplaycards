import { useCardOptions, useCardRelations } from '../../hooks';
import { rarities } from '../data';
import { CardInterface } from '../../../types';
import { useEffect, useMemo } from 'react';

const useRarity = () => {
  const { rarityId, stateSetter } = useCardOptions();
  const { rarity, type, subtype, variation } = useCardRelations();

  const setRarity = useMemo(
    () => stateSetter<CardInterface['rarityId']>('rarityId'),
    [stateSetter],
  );

  useEffect(() => {
    if (!rarityId || !type) return;
    if (
      !type.rarities?.includes(rarityId) &&
      (variation
        ? !variation.rarities?.includes(rarityId)
        : !subtype ||
          !subtype.relations
            ?.find(r => r.type === type.id)
            ?.rarities?.includes(rarityId))
    ) {
      setRarity(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setRarity, subtype, type, variation]);

  return {
    rarities: rarities || [],
    rarity,
    setRarity,
  };
};

export default useRarity;

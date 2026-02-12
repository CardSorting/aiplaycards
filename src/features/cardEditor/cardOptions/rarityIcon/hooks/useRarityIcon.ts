import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import { common, rarityIcons } from '../data';

const useRarityIcon = () => {
  const { rarityIconId, stateSetter } = useCardOptions();

  const rarityIcon = useMemo<RelationsInterface['rarityIcon']>(
    () => findById(rarityIcons, rarityIconId, common),
    [rarityIconId],
  );

  const setRarityIcon = useMemo(
    () => stateSetter<CardInterface['rarityIconId']>('rarityIconId'),
    [stateSetter],
  );

  return {
    rarityIcons,
    rarityIcon,
    setRarityIcon,
  };
};

export default useRarityIcon;

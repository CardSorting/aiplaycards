import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import { setIcons, swordAndShield } from '../data';

const useSetIcon = () => {
  const { setIconId, stateSetter, customSetIconSrc } = useCardOptions();

  const setIcon = useMemo<RelationsInterface['setIcon']>(
    () => findById(setIcons, setIconId, swordAndShield),
    [setIconId],
  );

  const setSetIcon = useMemo(
    () => stateSetter<CardInterface['setIconId']>('setIconId'),
    [stateSetter],
  );

  const setCustomSetIconSrc = useMemo(
    () => stateSetter<CardInterface['customSetIconSrc']>('customSetIconSrc'),
    [stateSetter],
  );

  return {
    setIcons,
    setIcon,
    setSetIcon,
    customSetIconSrc,
    setCustomSetIconSrc,
  };
};

export default useSetIcon;

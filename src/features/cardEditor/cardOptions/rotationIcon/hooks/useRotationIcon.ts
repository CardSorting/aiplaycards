import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import { d, rotationIcons } from '../data';

const useRotationIcon = () => {
  const { rotationIconId, stateSetter } = useCardOptions();

  const rotationIcon = useMemo<RelationsInterface['rotationIcon']>(
    () => findById(rotationIcons, rotationIconId, d),
    [rotationIconId],
  );

  const setRotationIcon = useMemo(
    () => stateSetter<CardInterface['rotationIconId']>('rotationIconId'),
    [stateSetter],
  );

  return {
    rotationIcons,
    rotationIcon,
    setRotationIcon,
  };
};

export default useRotationIcon;

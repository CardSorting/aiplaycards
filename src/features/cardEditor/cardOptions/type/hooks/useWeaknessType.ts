import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import { water } from '../data';
import useType from './useType';

const useWeaknessType = () => {
  const { weaknessTypeId, stateSetter } = useCardOptions();
  const { attackCostTypes } = useType();

  const weaknessType = useMemo<RelationsInterface['weaknessType']>(
    () => findById(attackCostTypes, weaknessTypeId, water),
    [attackCostTypes, weaknessTypeId],
  );

  const setWeaknessType = useMemo(
    () => stateSetter<CardInterface['weaknessTypeId']>('weaknessTypeId'),
    [stateSetter],
  );

  return {
    weaknessType,
    setWeaknessType,
  };
};

export default useWeaknessType;

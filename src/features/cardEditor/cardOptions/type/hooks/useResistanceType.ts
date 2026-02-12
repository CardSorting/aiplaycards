import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import useType from './useType';

const useResistanceType = () => {
  const { resistanceTypeId, stateSetter } = useCardOptions();
  const { attackCostTypes } = useType();

  const resistanceType = useMemo<RelationsInterface['resistanceType']>(
    () => findById(attackCostTypes, resistanceTypeId, undefined),
    [attackCostTypes, resistanceTypeId],
  );

  const setResistanceType = useMemo(
    () => stateSetter<CardInterface['resistanceTypeId']>('resistanceTypeId'),
    [stateSetter],
  );

  return {
    resistanceType,
    setResistanceType,
  };
};

export default useResistanceType;

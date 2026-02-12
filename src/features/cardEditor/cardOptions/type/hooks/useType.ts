import { CardInterface } from '../../../types';
import { useCallback, useEffect, useMemo } from 'react';
import { useCardOptions, useCardRelations } from '../../hooks';
import { defaultSupertypeTypes } from '../../defaults';
import findById from '../../../../../utils/findById';
import { Type } from '../types';
import { types } from '../data';

const useType = () => {
  const { stateSetter } = useCardOptions();
  const { supertype, type } = useCardRelations();

  const pokemonTypes = useMemo<Type[]>(
    () => types?.filter(t => t.logic?.isPokemonType) || [],
    [],
  );

  const attackCostTypes = useMemo<Type[]>(
    () => types?.filter(t => t.logic?.isAttackCostType) || [],
    [],
  );

  const setType = useMemo(
    () => stateSetter<CardInterface['typeId']>('typeId'),
    [stateSetter],
  );

  const getTypeById = useCallback(
    (id: number) => findById(types || [], id),
    [],
  );

  useEffect(() => {
    if (type && supertype && !type.supertypes?.includes(supertype.id)) {
      setType(defaultSupertypeTypes[supertype.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setType, supertype, type]);

  return {
    attackCostTypes,
    pokemonTypes,
    types: types || [],
    type,
    setType,
    getTypeById,
  };
};

export default useType;

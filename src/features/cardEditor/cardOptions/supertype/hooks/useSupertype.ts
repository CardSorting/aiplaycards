import { useCardOptions, useCardRelations } from '../../hooks';
import { CardInterface } from '../../../types';
import { useMemo } from 'react';
import { supertypes } from '../data';

const useSupertype = () => {
  const { stateSetter } = useCardOptions();
  const { supertype } = useCardRelations();

  const setSupertype = useMemo(
    () => stateSetter<CardInterface['supertypeId']>('supertypeId'),
    [stateSetter],
  );

  return {
    supertypes: supertypes || [],
    supertype,
    setSupertype,
  };
};

export default useSupertype;

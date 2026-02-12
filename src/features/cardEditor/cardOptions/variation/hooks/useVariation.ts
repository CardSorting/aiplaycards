import { CardInterface } from '../../../types';
import { useEffect, useMemo } from 'react';
import { useCardOptions, useCardRelations } from '../../hooks';
import { defaultSubtypeVariations } from '../../defaults';
import { variations } from '../data';

const useVariation = () => {
  const { stateSetter } = useCardOptions();
  const { variation, subtype } = useCardRelations();

  const setVariation = useMemo(
    () => stateSetter<CardInterface['variationId']>('variationId'),
    [stateSetter],
  );

  useEffect(() => {
    if (!subtype) setVariation(undefined);
    else if (!variation?.subtypes.includes(subtype.id)) {
      setVariation(defaultSubtypeVariations[subtype.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setVariation, subtype]);

  return {
    variations,
    variation,
    setVariation,
  };
};

export default useVariation;

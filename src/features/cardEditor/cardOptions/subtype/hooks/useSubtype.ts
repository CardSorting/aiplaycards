import { CardInterface } from '../../../types';
import { useEffect, useMemo } from 'react';
import { useCardOptions, useCardRelations } from '../../hooks';
import { defaultTypeSubtypes } from '../../defaults';
import { subtypes } from '../data';

const useSubtype = () => {
  const { stateSetter } = useCardOptions();
  const { type, subtype } = useCardRelations();

  const setSubtype = useMemo(
    () => stateSetter<CardInterface['subtypeId']>('subtypeId'),
    [stateSetter],
  );

  useEffect(() => {
    if (
      type &&
      (!subtype || !subtype.relations?.find(r => r.type === type.id))
    ) {
      setSubtype(defaultTypeSubtypes[type.id]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setSubtype, type]);

  return {
    subtypes: subtypes || [],
    subtype,
    setSubtype,
  };
};

export default useSubtype;

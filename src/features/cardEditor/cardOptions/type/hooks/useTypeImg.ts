import { CardInterface, RelationsInterface } from '../../../types';
import findById from '../../../../../utils/findById';
import { useMemo } from 'react';
import { useCardOptions } from '../../hooks';
import { colorless } from '../data';
import useType from './useType';

const useTypeImg = () => {
  const { typeImgId, customTypeImgSrc, stateSetter, typeImgAmount } =
    useCardOptions();
  const { pokemonTypes } = useType();

  const typeImg = useMemo<RelationsInterface['typeImg']>(
    () => findById(pokemonTypes, typeImgId, colorless),
    [pokemonTypes, typeImgId],
  );

  const setTypeImg = useMemo(
    () => stateSetter<CardInterface['typeImgId']>('typeImgId'),
    [stateSetter],
  );

  const setCustomTypeImgSrc = useMemo(
    () => stateSetter<CardInterface['customTypeImgSrc']>('customTypeImgSrc'),
    [stateSetter],
  );

  const setTypeImgAmount = useMemo(
    () => stateSetter<CardInterface['typeImgAmount']>('typeImgAmount'),
    [stateSetter],
  );

  return {
    typeImg,
    setTypeImg,
    customTypeImgSrc,
    setCustomTypeImgSrc,
    typeImgAmount,
    setTypeImgAmount,
  };
};

export default useTypeImg;

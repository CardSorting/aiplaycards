import { CardStylesContext } from '../Context';
import { useContext } from 'react';

const useCardStyles = () => {
  const { state, cardImgSrc } = useContext(CardStylesContext);

  return {
    ...state,
    cardImgSrc,
  };
};

export default useCardStyles;

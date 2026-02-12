import { CardLogicContext } from '../Context';
import { useContext } from 'react';

const useCardLogic = () => {
  const { state, greatestEnergyCost } = useContext(CardLogicContext);

  return {
    ...state,
    greatestEnergyCost,
  };
};

export default useCardLogic;

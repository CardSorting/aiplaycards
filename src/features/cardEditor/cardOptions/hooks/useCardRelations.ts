import { useContext } from 'react';
import { CardOptionsContext } from '../Context';

const useCardRelations = () => {
  const { relations } = useContext(CardOptionsContext);

  return relations;
};

export default useCardRelations;

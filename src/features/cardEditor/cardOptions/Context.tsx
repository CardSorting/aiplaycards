import { CardInterface, RelationsInterface } from '../types';
import React, {
  Dispatch,
  SetStateAction,
  createContext,
  useMemo,
  useState,
} from 'react';
import findById from '../../../utils/findById';
import { defaultCardOptions } from './defaults';
import { baseSets, swordAndShield } from './baseSet';
import { rarities } from './rarity';
import { common } from './rarityIcon';
import { d, rotationIcons } from './rotationIcon';
import { swordAndShield as baseSetIcon, setIcons } from './setIcon';
import { basic, subtypes } from './subtype';
import { pokemon, supertypes } from './supertype';
import { colorless, grass, types, water } from './type';
import { variations } from './variation';

export type CardOptionsState = CardInterface;

interface CardOptionsContextInterface {
  state: CardOptionsState;
  setState: Dispatch<SetStateAction<CardOptionsState>>;
  relations: RelationsInterface;
}

const initialState: CardOptionsState = defaultCardOptions;

// Create default relations locally to avoid circular dependencies
const defaultRelations: RelationsInterface = {
  baseSet: swordAndShield,
  supertype: pokemon,
  type: grass,
  subtype: basic,
  rarity: undefined,
  variation: undefined,
  weaknessType: water,
  resistanceType: undefined,
  setIcon: baseSetIcon,
  rotationIcon: d,
  rarityIcon: common,
  typeImg: colorless,
};

export const CardOptionsContext = createContext<CardOptionsContextInterface>({
  state: initialState,
  setState: () => null,
  relations: defaultRelations,
});

export const CardOptionsProvider: React.FC<{
  children: React.ReactNode;
  initialState?: Partial<CardOptionsState>;
}> = ({ children, initialState: providedInitialState }) => {
  const [state, setState] = useState<CardOptionsState>({
    ...initialState,
    ...(providedInitialState || {}),
  });

  const baseSet = useMemo<RelationsInterface['baseSet']>(
    () => findById(baseSets, state.baseSetId, defaultRelations.baseSet),
    [state.baseSetId],
  );

  const supertype = useMemo<RelationsInterface['supertype']>(
    () => findById(supertypes, state.supertypeId, defaultRelations.supertype),
    [state.supertypeId],
  );

  const type = useMemo<RelationsInterface['type']>(
    () => findById(types, state.typeId, defaultRelations.type),
    [state.typeId],
  );

  const subtype = useMemo<RelationsInterface['subtype']>(
    () => findById(subtypes, state.subtypeId, defaultRelations.subtype),
    [state.subtypeId],
  );

  const variation = useMemo<RelationsInterface['variation']>(
    () => findById(variations, state.variationId, defaultRelations.variation),
    [state.variationId],
  );

  const rarity = useMemo<RelationsInterface['rarity']>(
    () => findById(rarities, state.rarityId, defaultRelations.rarity),
    [state.rarityId],
  );

  const weaknessType = useMemo<RelationsInterface['weaknessType']>(
    () => findById(types, state.weaknessTypeId, defaultRelations.weaknessType),
    [state.weaknessTypeId],
  );

  const resistanceType = useMemo<RelationsInterface['resistanceType']>(
    () =>
      findById(types, state.resistanceTypeId, defaultRelations.resistanceType),
    [state.resistanceTypeId],
  );

  const setIcon = useMemo<RelationsInterface['setIcon']>(
    () => findById(setIcons, state.setIconId, defaultRelations.setIcon),
    [state.setIconId],
  );

  const rotationIcon = useMemo<RelationsInterface['rotationIcon']>(
    () =>
      findById(
        rotationIcons,
        state.rotationIconId,
        defaultRelations.rotationIcon,
      ),
    [state.rotationIconId],
  );

  const rarityIcon = useMemo<RelationsInterface['rarityIcon']>(
    () => findById(rarities, state.rarityIconId, defaultRelations.rarityIcon),
    [state.rarityIconId],
  );

  const typeImg = useMemo<RelationsInterface['typeImg']>(
    () => findById(types, state.typeImgId, defaultRelations.typeImg),
    [state.typeImgId],
  );

  return (
    <CardOptionsContext.Provider
      value={{
        state,
        setState,
        relations: {
          baseSet,
          supertype,
          type,
          subtype,
          variation,
          rarity,
          weaknessType,
          resistanceType,
          setIcon,
          rotationIcon,
          rarityIcon,
          typeImg,
        },
      }}
    >
      {children}
    </CardOptionsContext.Provider>
  );
};

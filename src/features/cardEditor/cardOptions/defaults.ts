import { RequiredIsh } from '../../../interfaces/utils';
import { CardInterface } from '../types';

export const defaultCardOptions: RequiredIsh<CardInterface> = {
  name: '',
  subname: '',
  backgroundImg: undefined,
  imgLayer1: undefined,
  imgLayer2: undefined,
  customSetIconSrc: undefined,
  prevolveImgSrc: undefined,
  customTypeImgSrc: undefined,
  typeImgAmount: 1,
  cardNumber: '',
  totalInSet: '',
  hitpoints: '',
  illustrator: '',
  weaknessAmount: 2,
  resistanceAmount: 30,
  retreatCost: 1,
  prevolveName: undefined,
  dexStats: '',

  description: '',
  hasAbility: false,
  ability: {
    name: '',
    description: '',
  },
  move1: {
    name: '',
    description: '',
    damageAmount: '',
    damageModifier: undefined,
    energyCost: [],
  },
  hasMove2: true,
  move2: {
    name: '',
    description: '',
    damageAmount: '',
    damageModifier: undefined,
    energyCost: [],
  },
  // Relations
  baseSetId: 1,
  supertypeId: 1,
  typeId: 1,
  subtypeId: 1,
  rarityId: 8,
  variationId: undefined,
  weaknessTypeId: 3,
  resistanceTypeId: undefined,
  setIconId: 1,
  rotationIconId: 1,
  rarityIconId: 1,
  typeImgId: 11,
};

export const defaultSupertypeTypes: {
  [supertypeId: number]: number;
} = {
  1: 1,
};

const defaultPokemonTypeSubtype = 1;

export const defaultTypeSubtypes: {
  [typeId: number]: number | undefined;
} = {
  1: defaultPokemonTypeSubtype,
  2: defaultPokemonTypeSubtype,
  3: defaultPokemonTypeSubtype,
  4: defaultPokemonTypeSubtype,
  5: defaultPokemonTypeSubtype,
  6: defaultPokemonTypeSubtype,
  7: defaultPokemonTypeSubtype,
  8: defaultPokemonTypeSubtype,
  9: defaultPokemonTypeSubtype,
  10: defaultPokemonTypeSubtype,
  11: defaultPokemonTypeSubtype,
};

export const defaultSubtypeVariations: {
  [subtypeId: number]: number | undefined;
} = {
  1: undefined,
  2: undefined,
  3: undefined,
  4: undefined,
  5: 1,
  6: undefined,
  7: undefined,
};

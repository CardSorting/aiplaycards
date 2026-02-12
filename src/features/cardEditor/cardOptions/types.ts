import { BaseSet } from './baseSet';
import { Rarity } from './rarity';
import { RarityIcon } from './rarityIcon';
import { RotationIcon } from './rotationIcon';
import { SetIcon } from './setIcon';
import { Subtype } from './subtype';
import { Supertype } from './supertype';
import { Type } from './type';
import { Variation } from './variation';

export type { CardTypeHelpers, IdentifierInfo } from './base-types';

export interface CardOptions {
  baseSets: BaseSet[];
  supertypes: Supertype[];
  types: Type[];
  subtypes: Subtype[];
  variations: Variation[];
  rarities: Rarity[];
  setIcons: SetIcon[];
  rotationIcons: RotationIcon[];
  rarityIcons: RarityIcon[];
}

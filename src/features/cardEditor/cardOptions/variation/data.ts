import { Variation } from './index';
import { basic, stage1, stage2 } from '../subtype';

export const light: Variation = {
  id: 3,
  slug: 'light',
  displayName: 'Light',
  subtypes: [basic.id, stage1.id, stage2.id],
  rarities: [],
};

export const dark: Variation = {
  id: 4,
  slug: 'dark',
  displayName: 'Dark',
  subtypes: [basic.id, stage1.id, stage2.id],
  rarities: [],
  styles: {
    rarityIconColor: 'white',
    cardInfoTextColor: 'black',
    cardInfoOutline: 'white',
    typeBarTextColor: 'black',
    typeBarOutline: 'white',
    dexStatsTextColor: 'black',
    dexStatsOutline: 'white',
  },
};

export const ex: Variation = {
  id: 5,
  slug: 'ex',
  displayName: 'ex',
  subtypes: [basic.id, stage1.id, stage2.id],
  rarities: [],
  logic: {
    hasDexEntry: false,
  },
  styles: {
    nameSymbol: 'ex',
    typeBarTextColor: 'white',
    dexStatsTextColor: 'white',
  },
};

export const variations: Variation[] = [light, dark, ex];

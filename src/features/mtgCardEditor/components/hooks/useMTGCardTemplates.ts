import { useCallback } from 'react';
import { MTGCard } from '../../types';
import { DEFAULT_MTG_CARD } from '../../types/constants';
import { generateCardId } from '../../utils/cardUtils';

export function useMTGCardTemplates() {
  const createTemplate = useCallback((template: Partial<MTGCard>): MTGCard => {
    return {
      ...DEFAULT_MTG_CARD,
      id: generateCardId(),
      ...template,
    };
  }, []);

  const templates = {
    // Creature Templates
    basicCreature: () =>
      createTemplate({
        name: 'Creature Name',
        manaCost: '{2}{G}',
        type: 'Creature — Beast',
        text: 'A basic creature with no abilities.',
        power: '3',
        toughness: '2',
        rarity: 'common',
      }),

    flyingCreature: () =>
      createTemplate({
        name: 'Sky Creature',
        manaCost: '{1}{W}',
        type: 'Creature — Bird',
        text: 'Flying',
        power: '2',
        toughness: '1',
        rarity: 'common',
      }),

    legendaryCreature: () =>
      createTemplate({
        name: 'Legendary Hero',
        manaCost: '{2}{W}{B}',
        type: 'Legendary Creature — Human Knight',
        text: 'Vigilance, lifelink\nWhenever ~ attacks, create a 1/1 white Soldier creature token.',
        power: '3',
        toughness: '4',
        rarity: 'rare',
      }),

    // Spell Templates
    instant: () =>
      createTemplate({
        name: 'Instant Spell',
        manaCost: '{1}{U}',
        type: 'Instant',
        text: 'Draw a card.',
        rarity: 'common',
      }),

    sorcery: () =>
      createTemplate({
        name: 'Sorcery Spell',
        manaCost: '{3}{R}',
        type: 'Sorcery',
        text: '~ deals 4 damage to any target.',
        rarity: 'common',
      }),

    // Artifact Templates
    equipment: () =>
      createTemplate({
        name: 'Magic Sword',
        manaCost: '{2}',
        type: 'Artifact — Equipment',
        text: 'Equipped creature gets +2/+1.\nEquip {2}',
        rarity: 'uncommon',
      }),

    artifact: () =>
      createTemplate({
        name: 'Utility Artifact',
        manaCost: '{3}',
        type: 'Artifact',
        text: '{T}: Draw a card, then discard a card.',
        rarity: 'uncommon',
      }),

    // Enchantment Templates
    aura: () =>
      createTemplate({
        name: 'Creature Enchantment',
        manaCost: '{1}{W}',
        type: 'Enchantment — Aura',
        text: 'Enchant creature\nEnchanted creature gets +1/+1 and has flying.',
        rarity: 'common',
      }),

    enchantment: () =>
      createTemplate({
        name: 'Global Enchantment',
        manaCost: '{2}{G}',
        type: 'Enchantment',
        text: 'All creatures get +1/+1.',
        rarity: 'uncommon',
      }),

    // Planeswalker Template
    planeswalker: () =>
      createTemplate({
        name: 'Planeswalker Name',
        manaCost: '{3}{U}{U}',
        type: 'Legendary Planeswalker — Name',
        text: '+1: Draw a card, then discard a card.\n-2: Return target creature to its owner\'s hand.\n-7: You get an emblem with "You have no maximum hand size."',
        loyalty: '4',
        rarity: 'mythic',
      }),

    // Land Templates
    basicLand: () =>
      createTemplate({
        name: 'Basic Land',
        manaCost: '',
        type: 'Basic Land — Plains',
        text: '{T}: Add {W}.',
        rarity: 'common',
      }),

    utilityLand: () =>
      createTemplate({
        name: 'Utility Land',
        manaCost: '',
        type: 'Land',
        text: '{T}: Add {C}.\n{T}: Target creature gains flying until end of turn.',
        rarity: 'uncommon',
      }),
  };

  const getTemplatesByCategory = useCallback(() => {
    return {
      Creatures: [
        {
          key: 'basicCreature',
          name: 'Basic Creature',
          description: '3/2 creature for 3 mana',
        },
        {
          key: 'flyingCreature',
          name: 'Flying Creature',
          description: '2/1 flyer for 2 mana',
        },
        {
          key: 'legendaryCreature',
          name: 'Legendary Creature',
          description: 'Multicolor legendary with abilities',
        },
      ],
      Spells: [
        {
          key: 'instant',
          name: 'Instant',
          description: 'Simple card draw spell',
        },
        {
          key: 'sorcery',
          name: 'Sorcery',
          description: 'Damage dealing spell',
        },
      ],
      Artifacts: [
        {
          key: 'equipment',
          name: 'Equipment',
          description: 'Creature enhancement artifact',
        },
        {
          key: 'artifact',
          name: 'Utility Artifact',
          description: 'Activated ability artifact',
        },
      ],
      Enchantments: [
        { key: 'aura', name: 'Aura', description: 'Creature enchantment' },
        {
          key: 'enchantment',
          name: 'Enchantment',
          description: 'Global effect enchantment',
        },
      ],
      Planeswalkers: [
        {
          key: 'planeswalker',
          name: 'Planeswalker',
          description: 'Multi-ability planeswalker',
        },
      ],
      Lands: [
        {
          key: 'basicLand',
          name: 'Basic Land',
          description: 'Mana-producing basic land',
        },
        {
          key: 'utilityLand',
          name: 'Utility Land',
          description: 'Land with activated ability',
        },
      ],
    };
  }, []);

  const loadTemplate = useCallback(
    (templateKey: keyof typeof templates): MTGCard => {
      const templateFn = templates[templateKey];
      if (!templateFn) {
        throw new Error(`Template '${templateKey}' not found`);
      }
      return templateFn();
    },
    [],
  );

  return {
    templates,
    getTemplatesByCategory,
    loadTemplate,
    createTemplate,
  };
}

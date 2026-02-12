import useCardOptions from '@cardEditor/cardOptions/hooks/useCardOptions';
import { AICardData } from './types';

// List of canonical Pokemon names (first 151 for now, can be expanded)
const CANONICAL_POKEMON_NAMES = new Set([
  'Bulbasaur',
  'Ivysaur',
  'Venusaur',
  'Charmander',
  'Charmeleon',
  'Charizard',
  'Squirtle',
  'Wartortle',
  'Blastoise',
  'Caterpie',
  'Metapod',
  'Butterfree',
  'Weedle',
  'Kakuna',
  'Beedrill',
  'Pidgey',
  'Pidgeotto',
  'Pidgeot',
  'Rattata',
  'Raticate',
  'Spearow',
  'Fearow',
  'Ekans',
  'Arbok',
  'Pikachu',
  'Raichu',
  'Sandshrew',
  'Sandslash',
  'Nidoran♀',
  'Nidorina',
  'Nidoqueen',
  'Nidoran♂',
  'Nidorino',
  'Nidoking',
  'Cleffa',
  'Clefairy',
  'Clefable',
  'Vulpix',
  'Ninetales',
  'Jigglypuff',
  'Wigglytuff',
  'Zubat',
  'Golbat',
  'Oddish',
  'Gloom',
  'Vileplume',
  'Paras',
  'Parasect',
  'Venonat',
  'Venomoth',
  'Diglett',
  'Dugtrio',
  'Meowth',
  'Persian',
  'Psyduck',
  'Golduck',
  'Mankey',
  'Primeape',
  'Growlithe',
  'Arcanine',
  'Poliwag',
  'Poliwhirl',
  'Poliwrath',
  'Abra',
  'Kadabra',
  'Alakazam',
  'Machop',
  'Machoke',
  'Machamp',
  'Bellsprout',
  'Weepinbell',
  'Victreebel',
  'Tentacool',
  'Tentacruel',
  'Geodude',
  'Graveler',
  'Golem',
  'Ponyta',
  'Rapidash',
  'Slowpoke',
  'Slowbro',
  'Magnemite',
  'Magneton',
  "Farfetch'd",
  'Doduo',
  'Dodrio',
  'Seel',
  'Dewgong',
  'Grimer',
  'Muk',
  'Shellder',
  'Cloyster',
  'Gastly',
  'Haunter',
  'Gengar',
  'Drowzee',
  'Hypno',
  'Krabby',
  'Kingler',
  'Voltorb',
  'Electrode',
  'Exeggcute',
  'Exeggutor',
  'Cubone',
  'Marowak',
  'Hitmonlee',
  'Hitmonchan',
  'Lickitung',
  'Koffing',
  'Weezing',
  'Rhyhorn',
  'Rhydon',
  'Chansey',
  'Tangela',
  'Kangaskhan',
  'Horsea',
  'Seadra',
  'Goldeen',
  'Seaking',
  'Staryu',
  'Starmie',
  'Mr. Mime',
  'Scyther',
  'Jynx',
  'Electabuzz',
  'Magmar',
  'Pinsir',
  'Tauros',
  'Magikarp',
  'Gyarados',
  'Lapras',
  'Ditto',
  'Vaporeon',
  'Jolteon',
  'Flareon',
  'Omanyte',
  'Omastar',
  'Kabuto',
  'Kabutops',
  'Aerodactyl',
  'Snorlax',
  'Articuno',
  'Zapdos',
  'Moltres',
  'Dratini',
  'Dragonair',
  'Dragonite',
  'Mewtwo',
  'Mew',
]);

/**
 * Check if a Pokemon name is a canonical Pokemon name
 */
function isCanonicalPokemonName(name: string): boolean {
  return CANONICAL_POKEMON_NAMES.has(name);
}

export const generateCompleteCardPrompt = (pokemonName: string) => {
  // Check if this is a unique generated Pokemon name (not a canonical Pokemon)
  const isUniquePokemon = !isCanonicalPokemonName(pokemonName);

  return `
You are a Pokemon Trading Card Game expert. Create a COMPLETE Pokemon card for "${pokemonName}".

${
  isUniquePokemon
    ? `Since "${pokemonName}" is a unique, newly discovered Pokemon, create imaginative and creative data based on its name characteristics and inferred type.`
    : `Use your knowledge of ${pokemonName} to generate authentic stats, attacks, and details that match its canonical abilities and characteristics.`
}

Return this exact JSON structure:

{
  "name": "${pokemonName}",
  "subname": null,
  "hitpoints": 120,
  "supertypeId": 1,
  "typeId": 2,
  "subtypeId": 1,
  "variationId": null,
  "rarityId": null,
  "weaknessTypeId": 3,
  "resistanceTypeId": null,
  "retreatCost": 2,
  "illustrator": "PlayMore TCG",
  "cardNumber": "001",
  "totalInSet": "150",
  "dexStats": "Height: 1'04\\" Weight: 13.2 lbs",

  "description": null,
  "hasAbility": false,
  "ability": null,
  "move1": {
    "name": "Thunder Shock",
    "description": "Flip a coin. If tails, the attack fails.",
    "damageAmount": 30,
    "damageModifier": null,
    "energyCost": [
      {"amount": 1, "typeId": 4}
    ]
  },
  "hasMove2": true,
  "move2": {
    "name": "Thunderbolt",
    "description": "A powerful electric attack that requires discarding energy.",
    "damageAmount": 90,
    "damageModifier": null,
    "energyCost": [
      {"amount": 2, "typeId": 4},
      {"amount": 1, "typeId": 11}
    ]
  }
}

REFERENCE IDs:
Types: 1=Grass, 2=Fire, 3=Water, 4=Lightning, 5=Psychic, 6=Fighting, 7=Dark, 8=Metal, 9=Dragon, 10=Fairy, 11=Colorless
Subtypes: 1=Basic, 2=Stage1, 3=Stage2, 4=V, 5=VMAX, 6=VSTAR

GENERATION RULES:
1. ${
    isUniquePokemon
      ? `Analyze the Pokemon name to infer its type and characteristics, then create imaginative but believable data`
      : `Use canonical Pokemon data (type, evolution stage, size, abilities)`
  }
2. ${
    isUniquePokemon
      ? `Create 1-2 thematic attacks based on the Pokemon's inferred abilities and name characteristics`
      : `Create 1-2 thematic attacks based on the Pokemon's known moves`
  }
3. Set appropriate HP (Basic: 60-120, Stage1: 80-140, Stage2: 100-180)
4. Choose logical weakness/resistance based on Pokemon type matchups
5. Set retreat cost based on Pokemon size/weight (small=0-1, medium=1-2, large=2-4)
6. ${
    isUniquePokemon
      ? `Generate creative Pokedex entry and stats (always refer to ${pokemonName} by name, never use "this Pokemon")`
      : `Generate authentic Pokedex entry and stats (always refer to ${pokemonName} by name, never use "this Pokemon")`
  }
7. Make energy costs balanced (total 1-4 energy per attack)
8. Include interesting attack effects that match the Pokemon's personality
9. NEVER reference the Pokemon's name in attack descriptions - use generic descriptions that don't mention the Pokemon at all
10. Use "damageModifier": "×" for multiplication, "+" for addition, null for none
11. Set hasMove2 to false if Pokemon should only have 1 attack
12. Set hasAbility to true and include ability if Pokemon has a signature ability
13. Make card number sequential and set size appropriate (usually 150-200 cards per set)

${
  isUniquePokemon
    ? `Create an imaginative, balanced, and fun-to-play Pokemon card for this unique creature!`
    : `Create an authentic, balanced, and fun-to-play Pokemon card!`
}
`;
};

export const populateCardFromAI = (
  aiData: AICardData,
  cardOptions: ReturnType<typeof useCardOptions>,
) => {
  // Basic info
  cardOptions.setName(aiData.name);
  cardOptions.setSubname(aiData.subname || '');
  cardOptions.setHitpoints(aiData.hitpoints);
  cardOptions.setIllustrator(aiData.illustrator);
  cardOptions.setCardNumber(aiData.cardNumber);
  cardOptions.setTotalInSet(aiData.totalInSet);
  cardOptions.setDexStats(aiData.dexStats);

  cardOptions.setDescription(aiData.description || '');

  // Combat stats
  cardOptions.setWeaknessAmount(2);
  cardOptions.setResistanceAmount(30);
  cardOptions.setRetreatCost(aiData.retreatCost);

  // Moves and abilities
  cardOptions.setHasAbility(aiData.hasAbility);
  cardOptions.setAbility(aiData.ability || { name: '', description: '' });
  cardOptions.setMove1(aiData.move1);
  cardOptions.setHasMove2(aiData.hasMove2);
  cardOptions.setMove2(
    aiData.move2 || {
      name: '',
      description: '',
      damageAmount: '',
      damageModifier: undefined,
      energyCost: [],
    },
  );

  // Type system - these trigger context updates
  cardOptions.stateSetter('supertypeId')(aiData.supertypeId);
  cardOptions.stateSetter('typeId')(aiData.typeId);
  cardOptions.stateSetter('subtypeId')(aiData.subtypeId);
  cardOptions.stateSetter('variationId')(aiData.variationId);
  cardOptions.stateSetter('rarityId')(aiData.rarityId);
  cardOptions.stateSetter('weaknessTypeId')(aiData.weaknessTypeId);
  cardOptions.stateSetter('resistanceTypeId')(aiData.resistanceTypeId);

  // Set defaults for other required fields
  cardOptions.stateSetter('baseSetId')(1); // Sword & Shield
  cardOptions.stateSetter('setIconId')(1);
  cardOptions.stateSetter('rotationIconId')(1);
  cardOptions.stateSetter('rarityIconId')(1);
  cardOptions.stateSetter('typeImgId')(aiData.typeId);
};

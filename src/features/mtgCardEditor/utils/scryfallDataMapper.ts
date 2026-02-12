import { MTGCard, MTGCardFace, MTGColor, MTGLayout, MTGRarity } from '../types';
import {
  ScryfallCardData,
  ScryfallCardFace,
} from '../services/scryfallService';

function mapScryfallRarity(scryfallRarity: string): MTGRarity {
  switch (scryfallRarity.toLowerCase()) {
    case 'common':
      return 'common';
    case 'uncommon':
      return 'uncommon';
    case 'rare':
      return 'rare';
    case 'mythic':
      return 'mythic';
    default:
      return 'common';
  }
}

function mapScryfallLayout(scryfallLayout: string): MTGLayout {
  switch (scryfallLayout.toLowerCase()) {
    case 'normal':
      return 'normal';
    case 'split':
      return 'split';
    case 'flip':
      return 'flip';
    case 'transform':
      return 'transform';
    case 'modal_dfc':
      return 'modal_dfc';
    case 'meld':
      return 'meld';
    case 'leveler':
      return 'leveler';
    case 'saga':
      return 'saga';
    case 'adventure':
      return 'adventure';
    case 'planeswalker':
      return 'planeswalker';
    case 'battle':
      return 'battle';
    default:
      return 'normal';
  }
}

function mapScryfallColors(scryfallColors?: string[]): MTGColor[] {
  if (!scryfallColors) return [];

  return scryfallColors
    .map(color => {
      switch (color.toUpperCase()) {
        case 'W':
          return 'W';
        case 'U':
          return 'U';
        case 'B':
          return 'B';
        case 'R':
          return 'R';
        case 'G':
          return 'G';
        default:
          return null;
      }
    })
    .filter((color): color is MTGColor => color !== null);
}

function mapScryfallCardFace(scryfallFace: ScryfallCardFace): MTGCardFace {
  return {
    name: scryfallFace.name,
    manaCost: scryfallFace.mana_cost,
    type: scryfallFace.type_line,
    text: scryfallFace.oracle_text,
    power: scryfallFace.power,
    toughness: scryfallFace.toughness,
    loyalty: scryfallFace.loyalty,
    imageUrl: scryfallFace.image_uris?.large || scryfallFace.image_uris?.normal,
  };
}

function parseSubtypes(typeLine: string): string[] {
  // Split by '—' or '-' to separate types from subtypes
  const parts = typeLine.split(/[—-]/);
  if (parts.length < 2) return [];

  // Get the subtype part and split by spaces, filtering out empty strings
  return parts[1]
    .trim()
    .split(/\s+/)
    .filter(subtype => subtype.length > 0);
}

export function mapScryfallDataToMTGCard(
  scryfallData: ScryfallCardData,
): Partial<MTGCard> {
  const updates: Partial<MTGCard> = {
    name: scryfallData.name,
    manaCost: scryfallData.mana_cost,
    convertedManaCost: scryfallData.cmc,
    type: scryfallData.type_line,
    subTypes: parseSubtypes(scryfallData.type_line),
    rarity: mapScryfallRarity(scryfallData.rarity),
    set: scryfallData.set.toUpperCase(),
    artist: scryfallData.artist,
    flavorText: scryfallData.flavor_text,
    power: scryfallData.power,
    toughness: scryfallData.toughness,
    loyalty: scryfallData.loyalty,
    text: scryfallData.oracle_text,
    imageUrl: scryfallData.image_uris?.large || scryfallData.image_uris?.normal,
    layout: mapScryfallLayout(scryfallData.layout),
    colors: mapScryfallColors(scryfallData.colors),
    colorIdentity: mapScryfallColors(scryfallData.color_identity),
  };

  // Handle multi-faced cards
  if (scryfallData.card_faces && scryfallData.card_faces.length > 0) {
    updates.cardFaces = scryfallData.card_faces.map(mapScryfallCardFace);

    // For transform/modal DFC cards, use the front face data as primary
    const frontFace = scryfallData.card_faces[0];
    if (frontFace) {
      // Override primary card data with front face data
      updates.name = frontFace.name;
      updates.manaCost = frontFace.mana_cost;
      updates.type = frontFace.type_line;
      updates.subTypes = parseSubtypes(frontFace.type_line);
      updates.text = frontFace.oracle_text;
      updates.power = frontFace.power;
      updates.toughness = frontFace.toughness;
      updates.loyalty = frontFace.loyalty;
      updates.colors = mapScryfallColors(frontFace.colors);
      updates.imageUrl =
        frontFace.image_uris?.large || frontFace.image_uris?.normal;
    }
  }

  return updates;
}

import { MTGCard, MTGCardType, MTGColor } from '../types';
import { getColorsFromManaCost, parseManaCost } from './manaUtils';

export function parseCardType(typeString: string): MTGCardType {
  const parts = typeString.split('—').map(part => part.trim());
  const mainType = parts[0] || '';
  const subtypes = parts[1] ? parts[1].split(' ').filter(Boolean) : undefined;

  // Split main type into supertype and types
  const mainParts = mainType.split(' ').filter(Boolean);
  let supertype: string | undefined;
  const types: string[] = [];

  const supertypes = ['Basic', 'Legendary', 'Snow', 'World'];

  for (const part of mainParts) {
    if (supertypes.includes(part)) {
      supertype = part;
    } else {
      types.push(part);
    }
  }

  return {
    supertype,
    types,
    subtypes,
  };
}

export function formatCardType(cardType: MTGCardType): string {
  let result = '';

  if (cardType.supertype) {
    result += cardType.supertype + ' ';
  }

  result += cardType.types.join(' ');

  if (cardType.subtypes && cardType.subtypes.length > 0) {
    result += ' — ' + cardType.subtypes.join(' ');
  }

  return result;
}

export function getCardColors(card: MTGCard): MTGColor[] {
  const colors: MTGColor[] = [...card.colors];

  // Add colors from mana cost if not already present
  if (card.manaCost) {
    const manaCost = parseManaCost(card.manaCost);
    const manaColors = getColorsFromManaCost(manaCost);
    manaColors.forEach(color => {
      if (!colors.includes(color)) {
        colors.push(color);
      }
    });
  }

  // Add colors from card faces for double-faced cards
  if (card.cardFaces) {
    card.cardFaces.forEach(face => {
      if (face.manaCost) {
        const faceCost = parseManaCost(face.manaCost);
        const faceColors = getColorsFromManaCost(faceCost);
        faceColors.forEach(color => {
          if (!colors.includes(color)) {
            colors.push(color);
          }
        });
      }
    });
  }

  return colors;
}

export function getColorIdentity(card: MTGCard): MTGColor[] {
  const identity: MTGColor[] = [...card.colorIdentity];

  // Add colors from the card itself
  const cardColors = getCardColors(card);
  cardColors.forEach(color => {
    if (!identity.includes(color)) {
      identity.push(color);
    }
  });

  // Add colors from rules text (would need more complex parsing)
  // For now, we'll just use the colors already determined

  return identity.sort();
}

export function isCreature(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.includes('Creature');
}

export function isPlaneswalker(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.includes('Planeswalker');
}

export function isLand(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.includes('Land');
}

export function isSpell(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.some(type => ['Instant', 'Sorcery'].includes(type));
}

export function isArtifact(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.includes('Artifact');
}

export function isEnchantment(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.types.includes('Enchantment');
}

export function isLegendary(card: MTGCard): boolean {
  const cardType = parseCardType(card.type);
  return cardType.supertype === 'Legendary';
}

export function validateCardName(name: string): string | null {
  if (!name.trim()) {
    return 'Card name is required';
  }
  if (name.length > 50) {
    return 'Card name is too long (max 50 characters)';
  }
  return null;
}

export function validatePowerToughness(value: string): string | null {
  if (!value.trim()) {
    return 'This field is required for creatures';
  }

  // Allow numbers, *, X, and fractions
  if (!/^[\d*X+\-/]+$/.test(value)) {
    return 'Invalid format. Use numbers, *, X, +, -, or /';
  }

  return null;
}

export function validateLoyalty(value: string): string | null {
  if (!value.trim()) {
    return 'Starting loyalty is required for planeswalkers';
  }

  if (!/^\d+$/.test(value)) {
    return 'Loyalty must be a number';
  }

  return null;
}

export function generateCardId(): string {
  return `mtg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sanitizeCardText(text: string): string {
  // Remove excessive whitespace and normalize line breaks
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function parseCardText(text: string): string[] {
  // Split card text into abilities/paragraphs
  return text
    .split('\n\n')
    .map(paragraph => paragraph.trim())
    .filter(Boolean);
}

export function estimateCardComplexity(card: MTGCard): number {
  let complexity = 0;

  // Base complexity for card types
  const cardType = parseCardType(card.type);
  complexity += cardType.types.length;

  // Mana cost complexity
  if (card.manaCost) {
    const manaCost = parseManaCost(card.manaCost);
    if (manaCost.x) complexity += 2;
    if (manaCost.hybrid) complexity += manaCost.hybrid.length * 2;
    if (manaCost.phyrexian) complexity += manaCost.phyrexian.length;
  }

  // Text complexity (rough estimate)
  if (card.text) {
    const abilities = parseCardText(card.text);
    complexity += abilities.length;

    // Add complexity for common mechanics
    const mechanicsRegex =
      /\b(flying|trample|hexproof|indestructible|vigilance|reach|lifelink|deathtouch|first strike|double strike|haste|menace|prowess|flash|defender)\b/gi;
    const mechanics = card.text.match(mechanicsRegex) || [];
    complexity += mechanics.length * 0.5;
  }

  return Math.round(complexity);
}

export function getFrameColorFromCard(card: MTGCard): string {
  const cardColors = getCardColors(card);
  // const cardType = parseCardType(card.type);

  // Check if it's a land
  if (isLand(card)) {
    return 'land';
  }

  // Check if it's an artifact (but not artifact creatures with colors)
  if (isArtifact(card) && cardColors.length === 0) {
    return 'artifact';
  }

  // Determine frame color based on number of colors
  if (cardColors.length === 0) {
    return 'colorless';
  } else if (cardColors.length === 1) {
    // Single color
    const colorMap: Record<MTGColor, string> = {
      W: 'white',
      U: 'blue',
      B: 'black',
      R: 'red',
      G: 'green',
    };
    return colorMap[cardColors[0]] || 'colorless';
  } else if (cardColors.length === 2) {
    // Check for hybrid mana
    if (card.manaCost) {
      const manaCost = parseManaCost(card.manaCost);
      if (
        manaCost.hybrid &&
        manaCost.hybrid.length > 0 &&
        !manaCost.white &&
        !manaCost.blue &&
        !manaCost.black &&
        !manaCost.red &&
        !manaCost.green &&
        !manaCost.generic
      ) {
        // Pure hybrid card - use hybrid frame
        const hybridColors = manaCost.hybrid[0].colors;
        return `hybrid-${hybridColors.join('').toLowerCase()}`;
      }
    }
    return 'multicolor';
  } else {
    // 3 or more colors
    return 'multicolor';
  }
}

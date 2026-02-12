import { MTGColor, MTGManaCost } from '../types';

export function parseManaCost(costString: string): MTGManaCost {
  const cost: MTGManaCost = {};
  const symbols = costString.match(/\{[^}]+\}/g) || [];

  for (const symbol of symbols) {
    const content = symbol.slice(1, -1); // Remove { }

    if (content === 'X') {
      cost.x = (cost.x || 0) + 1;
    } else if (content === 'W') {
      cost.white = (cost.white || 0) + 1;
    } else if (content === 'U') {
      cost.blue = (cost.blue || 0) + 1;
    } else if (content === 'B') {
      cost.black = (cost.black || 0) + 1;
    } else if (content === 'R') {
      cost.red = (cost.red || 0) + 1;
    } else if (content === 'G') {
      cost.green = (cost.green || 0) + 1;
    } else if (content === 'C') {
      cost.colorless = (cost.colorless || 0) + 1;
    } else if (/^\d+$/.test(content)) {
      cost.generic = (cost.generic || 0) + parseInt(content, 10);
    } else if (content.includes('/')) {
      // Handle hybrid and Phyrexian mana
      const parts = content.split('/');
      if (parts[1] === 'P') {
        // Phyrexian mana
        if (!cost.phyrexian) cost.phyrexian = [];
        cost.phyrexian.push(parts[0] as MTGColor);
      } else {
        // Hybrid mana
        if (!cost.hybrid) cost.hybrid = [];
        const existingHybrid = cost.hybrid.find(
          h =>
            h.colors.includes(parts[0] as MTGColor) &&
            h.colors.includes(parts[1] as MTGColor),
        );
        if (existingHybrid) {
          existingHybrid.amount++;
        } else {
          cost.hybrid.push({
            colors: [parts[0] as MTGColor, parts[1] as MTGColor],
            amount: 1,
          });
        }
      }
    }
  }

  return cost;
}

export function formatManaCost(cost: MTGManaCost): string {
  const symbols: string[] = [];

  if (cost.generic) {
    symbols.push(`{${cost.generic}}`);
  }

  if (cost.x) {
    for (let i = 0; i < cost.x; i++) {
      symbols.push('{X}');
    }
  }

  const colors: Array<{ key: keyof MTGManaCost; symbol: string }> = [
    { key: 'white', symbol: 'W' },
    { key: 'blue', symbol: 'U' },
    { key: 'black', symbol: 'B' },
    { key: 'red', symbol: 'R' },
    { key: 'green', symbol: 'G' },
  ];

  for (const { key, symbol } of colors) {
    const count = cost[key] as number;
    if (count) {
      for (let i = 0; i < count; i++) {
        symbols.push(`{${symbol}}`);
      }
    }
  }

  if (cost.colorless) {
    for (let i = 0; i < cost.colorless; i++) {
      symbols.push('{C}');
    }
  }

  if (cost.hybrid) {
    for (const hybrid of cost.hybrid) {
      for (let i = 0; i < hybrid.amount; i++) {
        symbols.push(`{${hybrid.colors.join('/')}}`);
      }
    }
  }

  if (cost.phyrexian) {
    for (const color of cost.phyrexian) {
      symbols.push(`{${color}/P}`);
    }
  }

  return symbols.join('');
}

export function calculateConvertedManaCost(cost: MTGManaCost): number {
  let cmc = 0;

  if (cost.generic) cmc += cost.generic;
  if (cost.white) cmc += cost.white;
  if (cost.blue) cmc += cost.blue;
  if (cost.black) cmc += cost.black;
  if (cost.red) cmc += cost.red;
  if (cost.green) cmc += cost.green;
  if (cost.colorless) cmc += cost.colorless;

  if (cost.hybrid) {
    for (const hybrid of cost.hybrid) {
      cmc += hybrid.amount;
    }
  }

  if (cost.phyrexian) {
    cmc += cost.phyrexian.length;
  }

  // X costs don't contribute to CMC when on the stack
  return cmc;
}

export function getColorsFromManaCost(cost: MTGManaCost): MTGColor[] {
  const colors: MTGColor[] = [];

  if (cost.white) colors.push('W');
  if (cost.blue) colors.push('U');
  if (cost.black) colors.push('B');
  if (cost.red) colors.push('R');
  if (cost.green) colors.push('G');

  if (cost.hybrid) {
    for (const hybrid of cost.hybrid) {
      colors.push(...hybrid.colors);
    }
  }

  if (cost.phyrexian) {
    colors.push(...cost.phyrexian);
  }

  return [...new Set(colors)];
}

export function renderManaSymbol(symbol: string): string {
  // This would typically return HTML or JSX for rendering mana symbols
  // For now, we'll just return the symbol as-is
  return symbol;
}

export function isManaSymbolValid(symbol: string): boolean {
  const validPatterns = [
    /^\{\d+\}$/, // Generic mana like {3}
    /^\{[WUBRGC]\}$/, // Single colored/colorless mana
    /^\{X\}$/, // X mana
    /^\{[WUBRG]\/[WUBRG]\}$/, // Hybrid mana
    /^\{[WUBRG]\/P\}$/, // Phyrexian mana
    /^\{T\}$/, // Tap
    /^\{Q\}$/, // Untap
    /^\{E\}$/, // Energy
  ];

  return validPatterns.some(pattern => pattern.test(symbol));
}

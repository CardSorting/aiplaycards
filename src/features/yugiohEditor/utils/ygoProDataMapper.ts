import { YugiohCardData } from '../types';
import { YgoProCardData } from '../services/ygoProService';

export function mapYgoProDataToCardData(
  ygoProData: YgoProCardData,
  currentCardData: YugiohCardData,
): Partial<YugiohCardData> {
  const updates: Partial<YugiohCardData> = {
    cardTitle: ygoProData.name,
    cardInfo: ygoProData.desc,
  };

  // Map card type
  if (ygoProData.type.includes('Monster')) {
    updates.cardType = 'Monster';

    // Map monster subtype
    if (ygoProData.type.includes('Normal')) {
      updates.cardSubtype = 'Normal';
    } else if (ygoProData.type.includes('Effect')) {
      updates.cardSubtype = 'Effect';
    } else if (ygoProData.type.includes('Fusion')) {
      updates.cardSubtype = 'Fusion';
    } else if (ygoProData.type.includes('Ritual')) {
      updates.cardSubtype = 'Ritual';
    } else if (ygoProData.type.includes('Synchro')) {
      updates.cardSubtype = 'Synchro';
    } else if (ygoProData.type.includes('Xyz')) {
      updates.cardSubtype = 'Xyz';
    } else if (ygoProData.type.includes('Link')) {
      updates.cardSubtype = 'Link';
    } else if (ygoProData.type.includes('Token')) {
      updates.cardSubtype = 'Token';
    } else {
      updates.cardSubtype = 'Effect'; // Default for monsters
    }

    // Map attribute
    if (ygoProData.attribute) {
      const attr = ygoProData.attribute.toUpperCase();
      if (
        ['DIVINE', 'EARTH', 'WATER', 'FIRE', 'WIND', 'LIGHT', 'DARK'].includes(
          attr,
        )
      ) {
        updates.cardAttr = attr as YugiohCardData['cardAttr'];
      }
    }

    // Map race/type
    updates.cardRace = ygoProData.race;

    // Map level/rank
    if (ygoProData.level !== undefined) {
      updates.cardLevel = ygoProData.level.toString();
    }

    // Map ATK/DEF
    if (ygoProData.atk !== undefined) {
      updates.cardATK = ygoProData.atk.toString();
    }
    if (ygoProData.def !== undefined) {
      updates.cardDEF = ygoProData.def.toString();
    }

    // Map pendulum scale
    if (ygoProData.scale !== undefined) {
      updates.Pendulum = true;
      updates.cardBLUE = ygoProData.scale;
      updates.cardRED = ygoProData.scale;
    }

    // Map link markers
    if (ygoProData.linkmarkers && ygoProData.linkmarkers.length > 0) {
      const linkMap: { [key: string]: number } = {
        'Top-Left': 1,
        Top: 2,
        'Top-Right': 3,
        Left: 4,
        Right: 6,
        'Bottom-Left': 7,
        Bottom: 8,
        'Bottom-Right': 9,
      };

      const newLinks = { ...currentCardData.links };

      // Reset all links
      for (let i = 1; i <= 9; i++) {
        if (i !== 5) {
          // Skip center position
          newLinks[i] = { val: false, symbol: '↗' };
        }
      }

      // Set active links
      ygoProData.linkmarkers.forEach(marker => {
        const linkIndex = linkMap[marker];
        if (linkIndex) {
          newLinks[linkIndex] = { val: true, symbol: '↗' };
        }
      });

      updates.links = newLinks;
    }

    // Handle special monster effects
    if (ygoProData.type.includes('Tuner')) {
      updates.cardEff1 = 'tuner';
    }
    if (ygoProData.type.includes('Flip')) {
      updates.cardEff2 = 'flip';
    }
    if (ygoProData.type.includes('Spirit')) {
      updates.cardEff2 = 'spirit';
    }
    if (ygoProData.type.includes('Union')) {
      updates.cardEff2 = 'union';
    }
    if (ygoProData.type.includes('Gemini')) {
      updates.cardEff2 = 'gemini';
    }
    if (ygoProData.type.includes('Toon')) {
      updates.cardEff2 = 'toon';
    }
  } else if (ygoProData.type.includes('Spell')) {
    updates.cardType = 'Spell';

    // Map spell subtype
    if (ygoProData.type.includes('Continuous')) {
      updates.cardSubtype = 'Continuous';
    } else if (ygoProData.type.includes('Field')) {
      updates.cardSubtype = 'Field';
    } else if (ygoProData.type.includes('Equip')) {
      updates.cardSubtype = 'Equip';
    } else if (ygoProData.type.includes('Quick-Play')) {
      updates.cardSubtype = 'Quick';
    } else if (ygoProData.type.includes('Ritual')) {
      updates.cardSubtype = 'Ritual';
    } else {
      updates.cardSubtype = 'Normal';
    }
  } else if (ygoProData.type.includes('Trap')) {
    updates.cardType = 'Trap';

    // Map trap subtype
    if (ygoProData.type.includes('Continuous')) {
      updates.cardSubtype = 'Continuous';
    } else if (ygoProData.type.includes('Counter')) {
      updates.cardSubtype = 'Counter';
    } else {
      updates.cardSubtype = 'Normal';
    }
  }

  return updates;
}

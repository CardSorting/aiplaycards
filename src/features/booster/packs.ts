export type BoosterPack = {
  slug: string;
  name: string;
  description?: string;
  gradient: string; // CSS gradient used for theming and thumbnails
  emoji?: string; // simple visual identifier when no image asset is available
};

// Single pack configuration for controlled pool management
export const PACKS: BoosterPack[] = [
  {
    slug: 'eldersigil',
    name: 'Eldersigil',
    description: 'Timeworn seals and arcane filigree',
    gradient: 'linear-gradient(135deg, #1976d2, #9c27b0)',
    emoji: '🎴',
  },
  // Additional packs commented out for controlled pool management
  // Uncomment one at a time as needed for pool management
  /*
  {
    slug: 'emberforged',
    name: 'Emberforged',
    description: 'Smoldering brass and rune-lit embers',
    gradient: 'linear-gradient(135deg, #ff512f, #dd2476)',
    emoji: '🔥',
  },
  {
    slug: 'tidebound',
    name: 'Tidebound',
    description: 'Foam-kissed blues and currents',
    gradient: 'linear-gradient(135deg, #00c6ff, #0072ff)',
    emoji: '💧',
  },
  {
    slug: 'aetherwave',
    name: 'Aetherwave',
    description: 'Dreamlike hues and drifting runes',
    gradient: 'linear-gradient(135deg, #fc466b, #3f5efb)',
    emoji: '🌅',
  },
  {
    slug: 'nightfall',
    name: 'Nightfall',
    description: 'Veiled shadows and silver glints',
    gradient: 'linear-gradient(135deg, #434343, #000000)',
    emoji: '🌑',
  },
  {
    slug: 'verdantwild',
    name: 'Verdantwild',
    description: 'Mossy greens and ancient bark',
    gradient: 'linear-gradient(135deg, #00b09b, #96c93d)',
    emoji: '🌿',
  },
  {
    slug: 'stormcall',
    name: 'Stormcall',
    description: 'Crackling runes and thunderlight',
    gradient: 'linear-gradient(135deg, #f7971e, #ffd200)',
    emoji: '⚡',
  },
  {
    slug: 'astralbound',
    name: 'Astralbound',
    description: 'Starfields strewn with cosmic sigils',
    gradient: 'linear-gradient(135deg, #1e3c72, #2a5298)',
    emoji: '🌌',
  },
  */
];

export function getPackBySlug(slug?: string | null): BoosterPack {
  if (!slug) return PACKS[0];
  return PACKS.find(p => p.slug === slug) || PACKS[0];
}

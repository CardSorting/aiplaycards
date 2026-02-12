/**
 * Browser-compatible client wrapper for pokemon-pool functionality
 * This avoids importing Node.js dependencies in the browser
 */

export interface PokemonPoolResponse {
  names?: string[];
  name?: string;
}

/**
 * Get all Pokemon names from the API
 */
export async function getPokemonNames(): Promise<string[]> {
  try {
    const response = await fetch('/api/pokemon-names');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: PokemonPoolResponse = await response.json();
    return data.names || [];
  } catch (error) {
    console.error('Failed to fetch Pokemon names:', error);
    // Return empty array on error - the API has its own fallbacks
    return [];
  }
}

/**
 * Get a single random Pokemon name from the API
 */
export async function getRandomPokemonName(): Promise<string> {
  try {
    const response = await fetch('/api/pokemon-names?action=random');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data: PokemonPoolResponse = await response.json();
    return data.name || 'Pikachu';
  } catch (error) {
    console.error('Failed to fetch random Pokemon name:', error);
    // Return default on error
    return 'Pikachu';
  }
}

/**
 * Choose a random item from an array (client-side utility)
 */
export function chooseRandom<T>(arr: T[]): T {
  if (arr.length === 0) {
    throw new Error('Cannot choose from empty array');
  }
  return arr[Math.floor(Math.random() * arr.length)];
}

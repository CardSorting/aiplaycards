import { NextRequest, NextResponse } from 'next/server';
import {
  DEFAULT_SPECIES_CACHE_TTL_MS,
  getInProcessSpecies,
} from '../../../src/utils/pokedex';

// This route serves a locally cached species list to avoid public rate limits.
// Point POKEDEX_SPECIES_URL to this route to eliminate external dependency at runtime.

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const ttlParam = url.searchParams.get('ttlMs');
    const ttlMs = ttlParam
      ? Math.max(60_000, Math.min(86_400_000, parseInt(ttlParam, 10)))
      : DEFAULT_SPECIES_CACHE_TTL_MS;

    const sourceUrl =
      process.env.POKEDEX_UPSTREAM_URL ||
      'https://pokeapi.co/api/v2/pokemon-species?limit=2000';

    const cachePath =
      process.env.POKEDEX_CACHE_PATH ||
      `${process.cwd()}/.cache/pokedex-species.json`;

    const { names, fromCache } = await getInProcessSpecies({
      cachePath,
      ttlMs,
      sourceUrl,
      inProcessTtlMs: Math.min(ttlMs, 2 * 60 * 1000),
    });

    return NextResponse.json({
      names,
      count: names.length,
      fromCache,
      cachePath,
      ttlMs,
    });
  } catch (error) {
    console.error('pokedex-cache error:', error);
    return NextResponse.json(
      { error: 'Failed to load Pokédex cache' },
      { status: 500 },
    );
  }
}

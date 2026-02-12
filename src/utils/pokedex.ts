import * as fs from 'node:fs/promises';
import * as path from 'node:path';

export const DEFAULT_SPECIES_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

export function normalizePokemonDisplayName(raw: string): string {
  return raw
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
    .replace(' Nidoran♀', ' Nidoran♀')
    .replace(' Nidoran♂', ' Nidoran♂');
}

export async function fetchWithGracefulBackoff(
  url: string,
  init: RequestInit,
  maxAttempts = 5,
  baseDelayMs = 500,
): Promise<Response> {
  let attempt = 0;
  let lastErr: unknown;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url, init);
      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        let delayMs = baseDelayMs * Math.pow(2, attempt);
        if (retryAfter) {
          const seconds = parseInt(retryAfter, 10);
          if (!Number.isNaN(seconds)) {
            delayMs = Math.max(delayMs, seconds * 1000);
          }
        }
        delayMs += Math.floor(Math.random() * 250);
        await new Promise(r => setTimeout(r, delayMs));
        attempt += 1;
        if (attempt >= maxAttempts) break;
        // retry loop
        // eslint-disable-next-line no-continue
        continue;
      }
      if (!res.ok && res.status >= 500) {
        const delayMs =
          baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
        await new Promise(r => setTimeout(r, delayMs));
        attempt += 1;
        if (attempt >= maxAttempts) break;
        // eslint-disable-next-line no-continue
        continue;
      }
      return res;
    } catch (e) {
      lastErr = e;
      const delayMs =
        baseDelayMs * Math.pow(2, attempt) + Math.floor(Math.random() * 250);
      await new Promise(r => setTimeout(r, delayMs));
      attempt += 1;
      if (attempt >= maxAttempts) break;
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error('Failed to fetch after retries');
}

export async function fetchSpeciesListFromSource(
  sourceUrl: string,
): Promise<string[]> {
  const res = await fetchWithGracefulBackoff(sourceUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Species fetch failed: ${res.status}`);

  const data = await res.json();
  // Accept either our cache format { names: string[] } or PokeAPI format { results: [{name}] }
  let names: string[] = [];
  const dataTyped = data as {
    names?: string[];
    results?: Array<{ name: string }>;
  };
  if (Array.isArray(dataTyped.names)) {
    names = dataTyped.names;
  } else if (Array.isArray(dataTyped.results)) {
    names = dataTyped.results.map(r => normalizePokemonDisplayName(r.name));
  } else {
    throw new Error('Unexpected species response shape');
  }

  const unique = Array.from(
    new Set(
      names.filter(n => n && typeof n === 'string' && n.trim().length > 0),
    ),
  );
  return unique;
}

type CacheFileShape = { updatedAt: string; names: string[] };

export async function readCacheFromDisk(
  cachePath: string,
): Promise<CacheFileShape | null> {
  try {
    const content = await fs.readFile(cachePath, 'utf8');
    const parsed = JSON.parse(content) as CacheFileShape;
    if (!Array.isArray(parsed.names)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export async function writeCacheToDisk(
  cachePath: string,
  names: string[],
): Promise<void> {
  const dir = path.dirname(cachePath);
  await fs.mkdir(dir, { recursive: true });
  const payload: CacheFileShape = {
    updatedAt: new Date().toISOString(),
    names,
  };
  await fs.writeFile(cachePath, JSON.stringify(payload, null, 2), 'utf8');
}

export async function getCachedSpecies(options: {
  cachePath: string;
  ttlMs?: number;
  sourceUrl: string;
}): Promise<{ names: string[]; fromCache: boolean }> {
  const {
    cachePath,
    ttlMs = DEFAULT_SPECIES_CACHE_TTL_MS,
    sourceUrl,
  } = options;
  const cached = await readCacheFromDisk(cachePath);
  const now = Date.now();
  const isFresh = cached?.updatedAt
    ? now - new Date(cached.updatedAt).getTime() < ttlMs
    : false;

  if (cached && isFresh) {
    return { names: cached.names, fromCache: true };
  }

  // Refresh from source
  const names = await fetchSpeciesListFromSource(sourceUrl);
  // Persist best effort
  try {
    await writeCacheToDisk(cachePath, names);
  } catch {
    // ignore disk write errors
  }
  return { names, fromCache: false };
}

// Lightweight in-process cache to avoid disk I/O on hot paths like workers
let inProcessCache: { names: string[]; expiresAt: number; key: string } | null =
  null;

export async function getInProcessSpecies(options: {
  cachePath: string;
  ttlMs?: number;
  sourceUrl: string;
  inProcessTtlMs?: number;
}): Promise<{ names: string[]; fromCache: boolean }> {
  const {
    cachePath,
    ttlMs = DEFAULT_SPECIES_CACHE_TTL_MS,
    sourceUrl,
    inProcessTtlMs = 5 * 60 * 1000,
  } = options;
  const key = `${cachePath}|${sourceUrl}`;
  const now = Date.now();
  if (
    inProcessCache &&
    inProcessCache.key === key &&
    inProcessCache.expiresAt > now
  ) {
    return { names: inProcessCache.names, fromCache: true };
  }
  const result = await getCachedSpecies({ cachePath, ttlMs, sourceUrl });
  inProcessCache = {
    names: result.names,
    expiresAt: now + Math.min(inProcessTtlMs, ttlMs),
    key,
  };
  return result;
}

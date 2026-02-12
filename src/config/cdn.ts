/**
 * CDN Configuration
 * Handles asset URL generation for local development vs production CDN
 */

// Cloudflare R2 public URL (set this after uploading assets to R2)
const CDN_BASE_URL = process.env.NEXT_PUBLIC_CDN_BASE_URL || '';

/**
 * Get the full URL for an asset
 * In development: uses local paths
 * In production with CDN: uses CDN URLs
 * In production without CDN: falls back to local paths
 */
export function getAssetUrl(path: string): string {
  // If CDN is configured, use it
  if (CDN_BASE_URL && process.env.NODE_ENV === 'production') {
    // Remove leading slash if present
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${CDN_BASE_URL}/${cleanPath}`;
  }
  // Otherwise use local path
  return path;
}

/**
 * Check if CDN is enabled
 */
export function isCdnEnabled(): boolean {
  return Boolean(CDN_BASE_URL && process.env.NODE_ENV === 'production');
}

/**
 * Get the CDN base URL
 */
export function getCdnBaseUrl(): string {
  return CDN_BASE_URL;
}

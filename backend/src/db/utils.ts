import { db } from './index';
import { sql as drizzleSql } from 'drizzle-orm';
import type { DbStatus, PaginatedResponse } from './types';

// Database connection utilities
export const dbUtils = {
  // Test database connection
  testConnection: async (): Promise<DbStatus> => {
    try {
      // Simple query to test connection (use Drizzle SQL for Neon HTTP driver)
      await db.execute(drizzleSql`select 1`);
      return {
        connected: true,
        timestamp: new Date(),
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date(),
      };
    }
  },

  // Ensure critical performance indexes exist for common query patterns
  // This runs once per process to avoid repeated DDL. Safe to call on cold starts.
  ensurePerformanceIndexes: (() => {
    let ensured = false;
    let inFlight: Promise<void> | null = null;
    return async (): Promise<void> => {
      if (ensured) return;
      if (inFlight) return inFlight;
      inFlight = (async () => {
        try {
          // Ensure marketplace table exists (runtime DDL for serverless simplicity)
          await db.execute(drizzleSql`
            CREATE TABLE IF NOT EXISTS public.marketplace_listings (
              id SERIAL PRIMARY KEY,
              card_id INTEGER NOT NULL REFERENCES public.cards(id),
              seller_user_id VARCHAR(255) NOT NULL REFERENCES public.users(user_id),
              price_credits INTEGER NOT NULL,
              status VARCHAR(32) NOT NULL DEFAULT 'active',
              buyer_user_id VARCHAR(255) REFERENCES public.users(user_id),
              sold_at TIMESTAMP,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            )
          `);

          // Composite covering index to accelerate user-scoped listings and reduce heap fetches
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS cards_user_id_created_at_cover_idx ON public.cards (user_id, created_at DESC) INCLUDE (id, name, type, subtype, supertype, rarity, hitpoints, is_public, image_data)`,
          );

          // Composite index to accelerate public listings ordered by created_at DESC
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS cards_is_public_created_at_idx ON public.cards (is_public, created_at DESC)`,
          );

          // Single-column index for generic ordering
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS cards_created_at_idx ON public.cards (created_at DESC)`,
          );

          // Booster jobs: ordering by created_at
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS booster_jobs_created_at_idx ON public.booster_jobs (created_at DESC)`,
          );

          // Users: accelerate username lookups used in profile endpoints
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS users_username_idx ON public.users (username)`,
          );

          // Marketplace: speed up listing queries
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS marketplace_listings_status_created_at_idx ON public.marketplace_listings (status, created_at DESC)`,
          );
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS marketplace_listings_card_id_idx ON public.marketplace_listings (card_id)`,
          );
          await db.execute(
            drizzleSql`CREATE INDEX IF NOT EXISTS marketplace_listings_seller_user_id_idx ON public.marketplace_listings (seller_user_id)`,
          );
        } finally {
          ensured = true;
          inFlight = null;
        }
      })();
      return inFlight;
    };
  })(),

  // Create paginated response helper
  createPaginatedResponse: <T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
  ): PaginatedResponse<T> => {
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  },

  // Validate required environment variables
  validateEnv: () => {
    const requiredEnvVars = ['DATABASE_URL'];
    const missing = requiredEnvVars.filter(envVar => !process.env[envVar]);

    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  },

  // Sanitize user input for database queries
  sanitizeString: (input: string, maxLength = 255): string => {
    return input.trim().substring(0, maxLength);
  },

  // Generate unique card number
  generateCardNumber: (setNumber: number, totalInSet: number): string => {
    return `${setNumber.toString().padStart(3, '0')}/${totalInSet
      .toString()
      .padStart(3, '0')}`;
  },
};

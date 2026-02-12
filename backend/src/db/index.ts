import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Get the database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Please add it to .env.local (local dev) or your deployment environment.',
  );
}

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: databaseUrl,
});

// Create the drizzle database instance
export const db = drizzle(pool, { schema });

export * from './schema';

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';

// Singleton pattern for database connection
let client: postgres.Sql | null = null;
let db: ReturnType<typeof drizzle> | null = null;

function getDatabaseClient() {
  if (!client) {
    client = postgres(env.DATABASE_URL!, {
      max: 1, // Disable connection pooling for serverless environments
      prepare: false,
    });
  }
  return client;
}

export function getDb() {
  if (!db) {
    const client = getDatabaseClient();
    db = drizzle(client, { schema: {} }); // Empty schema for starter kit
  }
  return db;
}

// For migrations
export const migrationClient = postgres(env.DATABASE_URL!, { max: 1 });
export const migrationDb = drizzle(migrationClient, { schema: {} });

export { getDb as db };

// Database utilities - Add your helper functions here
// This file can be used as a template for database operations

import { getDb } from './index';

const db = getDb();

// Example utility function - modify or remove as needed
export async function healthCheck() {
  try {
    await db.execute('SELECT 1');
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
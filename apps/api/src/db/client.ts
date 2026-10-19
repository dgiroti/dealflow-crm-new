import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env';

// A "pool" keeps a few connections open and reuses them,
// because opening a new database connection for every request is slow
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: 10, // at most 10 connections at the same time
  connectionTimeoutMillis: 5000, // give up after 5 seconds if the database doesn't answer
});

// "db" is what the rest of the app uses to query the database
export const db = drizzle({ client: pool });

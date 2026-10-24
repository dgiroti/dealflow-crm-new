import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env';

// AWS sets this variable automatically inside every Lambda function
const isLambda = Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);

// A "pool" keeps a few connections open and reuses them,
// because opening a new database connection for every request is slow
export const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  max: isLambda ? 1 : 10,
  connectionTimeoutMillis: 5000, // give up after 5 seconds if the database doesn't answer
  idleTimeoutMillis: 30_000, // close connections that haven't been used for 30 seconds
});

// Between requests, Lambda "freezes" your code, and an open connection can break while
// it's frozen. Without this listener, that broken connection would crash the whole function.
// With it, we log the problem, and the pool simply opens a new connection on the next query.
pool.on('error', (error) => {
  console.error('Unexpected database pool error:', error);
});

// "db" is what the rest of the app uses to query the database
export const db = drizzle({ client: pool });

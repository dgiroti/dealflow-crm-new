import { Router } from 'express';
import { sql } from 'drizzle-orm';
import type { HealthResponse } from '@dealflow/shared';
import { db } from '../../db/client';

export const healthRouter = Router();

// GET /api/v1/health → "is the API running, and can it reach the database?"
healthRouter.get('/', async (_req, res) => {
  let database: HealthResponse['database'] = 'up';
  try {
    // The smallest possible query: if this works, the database is reachable
    await db.execute(sql`select 1`);
  } catch (error) {
    console.error('Health check: database query failed:', error);
    database = 'down';
  }

  const body: HealthResponse = {
    status: database === 'up' ? 'ok' : 'degraded',
    database,
    timestamp: new Date().toISOString(),
  };

  res.status(database === 'up' ? 200 : 503).json(body);
});

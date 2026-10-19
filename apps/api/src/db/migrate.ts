import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './client';

// Applies every migration in ./drizzle that hasn't been applied yet
try {
  await migrate(db, { migrationsFolder: './drizzle' });
  console.log('Migrations applied');
} finally {
  await pool.end();
}

import { createApp } from './app';
import { env } from './config/env';
import { pool } from './db/client';

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`API running on http://localhost:${env.PORT}`);
});

// Graceful shutdown: when asked to stop, finish the requests already in progress,
// close the database connections, and only then exit.
const shutdown = (signal: string) => {
  console.log(`${signal} received, shutting down...`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM')); // sent by Docker, Kubernetes, etc.
process.on('SIGINT', () => shutdown('SIGINT')); // sent when you press Ctrl + C

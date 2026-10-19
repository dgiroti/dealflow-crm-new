import dotenv from 'dotenv';
import { defineConfig } from 'drizzle-kit';

dotenv.config({ quiet: true });

const url = process.env.DATABASE_URL;
if (!url) {
  throw new Error('DATABASE_URL is not set. Copy apps/api/.env.example to apps/api/.env');
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});

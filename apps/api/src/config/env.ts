import dotenv from 'dotenv';
import { z } from 'zod';

// Load apps/api/.env (if it exists) into process.env
dotenv.config({ quiet: true });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, 'DATABASE_URL must start with postgres:// or postgresql://'),
  // Signs access tokens. Anyone with this can create valid tokens, so it must be long and secret.
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters long'),
  // How long an access token lasts, e.g. 15m or 1h
  ACCESS_TOKEN_TTL: z
    .string()
    .regex(/^\d+[smhd]$/, 'ACCESS_TOKEN_TTL must look like 15m or 1h')
    .default('15m'),
  // How long you stay logged in without using the app
  REFRESH_TOKEN_TTL_DAYS: z.coerce.number().int().positive().default(7),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  throw new Error('Invalid environment variables');
}

export const env = parsed.data;

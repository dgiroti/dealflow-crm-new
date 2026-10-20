import { z } from 'zod';
import { roleSchema } from './roles';

// Emails are trimmed and lowercased BEFORE checking, so " Ali@Acme.com " and "ali@acme.com"
// are treated as the same address
const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email('Please enter a valid email address'));

export const registerSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Atleast 2 characeter required')
    .max(80, 'Workspace name must be at most 80 characters'),
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(80, 'Name must be at most 80 characters'),
  email: emailSchema,
  password: z
    .string()
    .trim()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const authUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  role: roleSchema,
  organization: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
});

export const authResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type AuthUser = z.infer<typeof authUserSchema>;
export type AuthResponse = z.infer<typeof authResponseSchema>;

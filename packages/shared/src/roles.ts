import { z } from 'zod';

// The three roles in a workspace
export const ROLES = ['admin', 'manager', 'rep'] as const;

export const roleSchema = z.enum(ROLES);

export type Role = z.infer<typeof roleSchema>;

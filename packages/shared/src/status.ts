import { z } from 'zod';

// The three roles in a workspace
export const STATUS = ['active', 'invited', 'disabled'] as const;

export const statusSchema = z.enum(STATUS);

export type STATUS = z.infer<typeof statusSchema>;

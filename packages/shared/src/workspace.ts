import { z } from 'zod';

export const updateWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Atleast 2 characeter required')
    .max(80, 'Workspace name must be at most 80 characters'),
});

export const workspaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  createdAt: z.string(),
});

export const workspaceResponseSchema = z.object({
  orgainzation: workspaceSchema,
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type Workspace = z.infer<typeof workspaceResponseSchema>;

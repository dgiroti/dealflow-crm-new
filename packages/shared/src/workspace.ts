import { z } from 'zod';

export const updateWorkspaceSchema = z.object({
  workspaceName: z
    .string()
    .trim()
    .min(2, 'Atleast 2 characeter required')
    .max(80, 'Workspace name must be at most 80 characters'),
});

export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;

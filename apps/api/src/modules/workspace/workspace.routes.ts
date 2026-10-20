import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from '@dealflow/shared';
import { db } from '../../db/client';
import { organizations } from '../../db/schema';
import { getAuth, requireAuth, requireRole } from '../../middleware/authenticate';
import { validate } from '../../middleware/validate';

export const workspaceRouter = Router();

// Every route in this file needs a logged-in user
workspaceRouter.use(requireAuth);

const workspaceFields = {
  id: organizations.id,
  name: organizations.name,
  slug: organizations.slug,
  createdAt: organizations.createdAt,
};

// GET /api/v1/workspace → any logged-in user can see their OWN workspace
workspaceRouter.get('/', async (_req, res) => {
  const orgId = getAuth(res).orgId;
  const [organization] = await db
    .select(workspaceFields)
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  res.json({ organization });
});
workspaceRouter.patch(
  '/',
  requireRole('admin'),
  validate(updateWorkspaceSchema),
  async (req, res) => {
    const { orgId } = getAuth(res);
    const { workspaceName } = req.body as UpdateWorkspaceInput;

    const [organization] = await db
      .update(organizations)
      .set({ name: workspaceName })
      .where(eq(organizations.id, orgId))
      .returning(workspaceFields);

    res.json({ organization });
  },
);

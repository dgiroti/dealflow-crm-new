import { randomBytes } from 'node:crypto';
import { and, eq, isNull } from 'drizzle-orm';
// import { eq } from 'drizzle-orm';
// import type { AuthResponse, AuthUser, LoginInput, RegisterInput } from '@dealflow/shared';
import type { AuthUser, LoginInput, RegisterInput } from '@dealflow/shared';
import { env } from '../../config/env';
import { db } from '../../db/client';
import { organizations, sessions, users } from '../../db/schema';
import { AppError } from '../../lib/errors';
import { hashPassword, verifyPassword } from '../../lib/password';
import {
  generateRefreshToken,
  hashToken,
  signAccessToken,
  type AuthContext,
} from '../../lib/tokens';

const REFRESH_TTL_MS = env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000;

// If a just-rotated refresh token is used again within this window, it's almost certainly
// two browser tabs refreshing at the same moment, not an attacker. Allow it.
const REUSE_GRACE_MS = 30_000;

// A fake hash, used when an email doesn't exist, so a failed login always takes the same time
const dummyHash = hashPassword('not-a-real-password-just-for-timing');

export type AuthResult = { accessToken: string; refreshToken: string; authUser: AuthUser };

// "Acme Sales!" → "acme-sales-3f9a1c": readable, plus random letters so it's always unique
const makeSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
  return `${base || 'workspace'}-${randomBytes(3).toString('hex')}`;
};

// Loads a user together with their workspace, using a JOIN
async function findAuthUser(where: ReturnType<typeof eq>) {
  const [row] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      status: users.status,
      passwordHash: users.passwordHash,
      orgId: organizations.id,
      orgName: organizations.name,
      orgSlug: organizations.slug,
    })
    .from(users)
    .innerJoin(organizations, eq(users.orgId, organizations.id))
    .where(where)
    .limit(1);
  return row;
}

export async function register(input: RegisterInput, userAgent?: string): Promise<AuthResult> {
  const existing = await findAuthUser(eq(users.email, input.email));
  if (existing) {
    throw new AppError(409, 'An account with this email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const userId = await db.transaction(async (tx) => {
    const [org] = await tx
      .insert(organizations)
      .values({ name: input.workspaceName, slug: makeSlug(input.workspaceName) })
      .returning({ id: organizations.id });

    const [user] = await tx
      .insert(users)
      .values({
        orgId: org.id,
        name: input.name,
        email: input.email,
        passwordHash,
        role: 'admin',
      })
      .returning({ id: users.id });

    return user.id;
  });

  const row = await findAuthUser(eq(users.id, userId));
  if (!row) throw new Error('User was not found right after creating it');
  return startSession(row, userAgent);
}

// ── Log in ──
export async function login(input: LoginInput, userAgent?: string): Promise<AuthResult> {
  const row = await findAuthUser(eq(users.email, input.email));
  const passwordOk = await verifyPassword(input.password, row?.passwordHash ?? (await dummyHash));

  if (!row || !passwordOk) {
    throw new AppError(401, 'Invalid email or password');
  }

  if (row.status !== 'active') {
    throw new AppError(403, 'This account has been disabled');
  }
  return startSession(row, userAgent);
}

// The safe, public version of a user: no password hash
const toAuthUser = (row: AuthUserRow): AuthUser => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  organization: { id: row.orgId, name: row.orgName, slug: row.orgSlug },
});

const toContext = (row: AuthUserRow): AuthContext => ({
  userId: row.id,
  orgId: row.orgId,
  role: row.role,
});

type AuthUserRow = NonNullable<Awaited<ReturnType<typeof findAuthUser>>>;

async function startSession(row: AuthUserRow, userAgent?: string): Promise<AuthResult> {
  const refreshToken = generateRefreshToken();

  await db.insert(sessions).values({
    userId: row.id,
    tokenHash: hashToken(refreshToken),
    userAgent: userAgent,
    expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
  });

  return {
    accessToken: await signAccessToken(toContext(row)),
    refreshToken: hashToken(refreshToken),
    authUser: toAuthUser(row),
  };
}

// ── Refresh: swap a refresh token for new tokens (and a NEW refresh token) ──
export async function refresh(refreshToken: string | undefined, userAgent?: string) {
  if (!refreshToken) throw new AppError(401, 'Not logged in');
  const [session] = await db
    .select()
    .from(sessions)
    .where(eq(sessions.tokenHash, hashToken(refreshToken)))
    .limit(1);

  if (!session) throw new AppError(401, 'invalid token');

  if (session.revokedAt) {
    const revokedAgo = Date.now() - session.revokedAt.getTime();
    if (revokedAgo > REUSE_GRACE_MS) {
      // REUSE DETECTED: a dead token is being used long after it was replaced.
      // Someone may have stolen it, so end EVERY session of this user.
      await db
        .update(sessions)
        .set({ revokedAt: new Date() })
        .where(and(eq(sessions.userId, session.userId), isNull(sessions.revokedAt)));

      console.warn(`Refresh token reuse detected for user ${session.userId}`);
      throw new AppError(401, 'Session expired. Please log in again.');
    }
    // Within the grace window: two tabs refreshing at once. Carry on.
  }

  if (session.expiresAt.getTime() < Date.now()) {
    throw new AppError(401, 'Session expired. Please log in again.');
  }

  const row = await findAuthUser(eq(users.id, session.userId));
  if (!row || row.status !== 'active') {
    throw new AppError(401, 'Session expired. Please log in again.');
  }

  // ROTATION: the old token stops working, and a new one is issued
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.id, session.id), isNull(sessions.revokedAt)));

  return startSession(row, userAgent);
}

// ── Log out: end this one session ──
export async function logout(refreshToken: string | undefined): Promise<void> {
  if (!refreshToken) throw new AppError(401, 'Not logged in');
  await db
    .update(sessions)
    .set({ revokedAt: new Date() })
    .where(and(eq(sessions.tokenHash, hashToken(refreshToken)), isNull(sessions.revokedAt)));
}

export async function getCurrentUser(userId: string): Promise<AuthUser> {
  if (!userId) throw new AppError(401, 'Not logged in');
  const row = await findAuthUser(eq(users.id, userId));
  if (!row) throw new AppError(401, 'Not authenticated');
  return toAuthUser(row);
}

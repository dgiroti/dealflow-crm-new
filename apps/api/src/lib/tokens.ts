import { createHash, randomBytes } from 'node:crypto';
import { SignJWT, jwtVerify } from 'jose';
import { roleSchema, type Role } from '@dealflow/shared';
import { env } from '../config/env';
import { AppError } from './errors';

const secret = new TextEncoder().encode(env.JWT_SECRET);
const ISSUER = 'dealflow-api';

// Who is making the request. Built ONLY from a verified token, never from what the client sends.
export type AuthContext = {
  userId: string;
  orgId: string;
  role: Role;
};

export async function signAccessToken(authContext: AuthContext): Promise<string> {
  return new SignJWT({ orgId: authContext.orgId, role: authContext.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(authContext.userId) // "sub" = who this token is about
    .setIssuer(ISSUER) // "iss" = who created it
    .setIssuedAt()
    .setExpirationTime(env.ACCESS_TOKEN_TTL)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthContext> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: ISSUER,
      algorithms: ['HS256'],
    });

    if (typeof payload.sub !== 'string' || typeof payload.orgId !== 'string') {
      throw new Error('Missing claims');
    }

    return { userId: payload.sub, orgId: payload.orgId, role: roleSchema.parse(payload.role) };
  } catch {
    // Expired, tampered with, or signed with another secret: all treated the same
    throw new AppError(401, 'Invalid or expired token');
  }
}

// 32 random bytes = 256 bits: impossible to guess
export const generateRefreshToken = (): string => randomBytes(32).toString('base64url');

// A refresh token is already random, so a fast hash (SHA-256) is enough. A slow hash like
// scrypt is only needed for passwords, which humans choose and attackers can guess.
export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

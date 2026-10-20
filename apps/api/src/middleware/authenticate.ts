import type { RequestHandler, Response } from 'express';
import type { Role } from '@dealflow/shared';
import { AppError } from '../lib/errors';
import { verifyAccessToken, type AuthContext } from '../lib/tokens';

// Only lets the request through if it carries a valid access token
export const requireAuth: RequestHandler = async (req, res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError(401, 'Not authenticated');
  }

  res.locals.auth = await verifyAccessToken(header.slice('Bearer '.length));
  next();
};

// Reads who's logged in (set by requireAuth above)
export const getAuth = (res: Response): AuthContext => {
  const auth = res.locals.auth as AuthContext | undefined;
  if (!auth) throw new AppError(401, 'Not authenticated');
  return auth;
};

// Only lets the request through if the user has one of these roles.
// Always use it AFTER requireAuth.
export const requireRole =
  (...allowed: Role[]): RequestHandler =>
  (_req, res, next) => {
    const { role } = getAuth(res);
    if (!allowed.includes(role)) {
      throw new AppError(403, 'You do not have permission to do this');
    }
    next();
  };

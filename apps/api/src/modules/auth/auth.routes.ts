import { Router, type CookieOptions, type Request, type Response } from 'express';
import {
  loginSchema,
  registerSchema,
  type AuthResponse,
  type LoginInput,
  type RegisterInput,
} from '@dealflow/shared';
import { env } from '../../config/env';
import { getAuth, requireAuth } from '../../middleware/authenticate';
import { authLimiter } from '../../middleware/rate-limit';
import { validate } from '../../middleware/validate';
import { getCurrentUser, login, logout, refresh, register, type AuthResult } from './auth.service';

const REFRESH_COOKIE = 'dealflow_refresh';

const refreshCookieOptions: CookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it
  secure: env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'lax', // not sent when another website submits a form to us
  path: '/api/v1/auth', // only ever sent to the auth endpoints
  maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
};

const clearRefreshCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE, { ...refreshCookieOptions, maxAge: undefined });
};

const readRefreshToken = (req: Request): string | undefined =>
  (req.cookies as Record<string, string | undefined>)[REFRESH_COOKIE];

export const authRouter = Router();

// Sets the cookie, and sends ONLY the access token and user in the body
const sendAuth = (res: Response, result: AuthResult, status = 200) => {
  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);
  res.status(status).json({
    accessToken: result.accessToken,
    user: result.authUser,
  } satisfies AuthResponse);
};

authRouter.post('/register', authLimiter, validate(registerSchema), async (req, res) => {
  const result = await register(req.body as RegisterInput, req.get('user-agent'));
  sendAuth(res, result, 201);
});

authRouter.post('/login', authLimiter, validate(loginSchema), async (req, res) => {
  const result = await login(req.body as LoginInput, req.get('user-agent'));
  sendAuth(res, result);
});

authRouter.post('/refresh', async (req, res) => {
  try {
    const result = await refresh(readRefreshToken(req), req.get('user-agent'));
    sendAuth(res, result);
  } catch (error) {
    clearRefreshCookie(res);
    throw error;
  }
});

authRouter.post('/logout', async (req, res) => {
  await logout(readRefreshToken(req));
  clearRefreshCookie(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, async (_req, res) => {
  const { userId } = getAuth(res);
  res.json({ user: await getCurrentUser(userId) });
});

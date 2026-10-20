import rateLimit from 'express-rate-limit';

// At most 20 sign-up/login attempts per IP address every 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many attempts, please try again in 15 minutes' },
});

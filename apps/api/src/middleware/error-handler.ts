import type { ErrorRequestHandler, RequestHandler } from 'express';
import { AppError } from '../lib/errors';

// Runs when no route matched the URL
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

// PostgreSQL reports problems with codes; Drizzle wraps the original error in "cause"
const postgresErrorCode = (err: unknown): string | undefined => {
  const e = err as { code?: string; cause?: { code?: string } };
  return e.code ?? e.cause?.code;
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Errors we threw on purpose
  if (err instanceof AppError) {
    res.status(err.status).json({ message: err.message });
    return;
  }
  // 23505 = unique violation, e.g. two people registering the same email at the same moment
  if (postgresErrorCode(err) === '23505') {
    res.status(409).json({ message: 'This record already exists' });
    return;
  }
  // Errors from express.json(): broken JSON (400) or a body that's too large (413)
  const status = (err as { status?: number }).status;
  if (status && status >= 400 && status < 500) {
    res.status(status).json({
      message: status === 413 ? 'Request body is too large' : 'Invalid request body',
    });
    return;
  }

  console.error(err);
  res.status(500).json({ message: 'Something went wrong' });
};

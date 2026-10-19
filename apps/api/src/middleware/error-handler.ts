import type { ErrorRequestHandler, RequestHandler } from 'express';

// Runs when no route matched the URL
export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
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

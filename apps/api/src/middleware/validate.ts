import type { RequestHandler } from 'express';
import type { z } from 'zod';

// Checks req.body against a schema, and replaces it with the cleaned values
export const validate =
  (schema: z.ZodType): RequestHandler =>
  (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: result.error.issues.map((issue) => ({
          field: issue.path.join('.') || 'body',
          message: issue.message,
        })),
      });
      return;
    }

    req.body = result.data;
    next();
  };

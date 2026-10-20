import express from 'express';
import helmet from 'helmet';
import { healthRouter } from './modules/health/health.routes';
import { errorHandler, notFound } from './middleware/error-handler';
import cookieParser from 'cookie-parser';
import { authRouter } from './modules/auth/auth.routes';
import { workspaceRouter } from './modules/workspace/workspace.routes';

export const createApp = () => {
  const app = express();
  // We sit behind one proxy (the Vite dev server now, Netlify/Lambda later).
  // Trust it for the real client IP, which rate limiting needs.
  app.set('trust proxy', 1);
  app.use(helmet());
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use('/api/v1/health', healthRouter);
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/workspace', workspaceRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

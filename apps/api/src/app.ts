import express from 'express';
import helmet from 'helmet';
import { healthRouter } from './modules/health/health.routes';
import { errorHandler, notFound } from './middleware/error-handler';

export const createApp = () => {
 const app = express();

 app.use(helmet());
 app.use(express.json({ limit: '10kb' }));

 app.use('/api/v1/health', healthRouter);

 app.use(notFound);
  app.use(errorHandler);

  return app

}
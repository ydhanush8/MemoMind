import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import { clerk } from './config/clerk.js';
import { corsOrigins } from './config/env.js';
import { httpLogger } from './middlewares/logger.middleware.js';
import { apiRateLimiter } from './middlewares/rateLimit.middleware.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';
import healthRoutes from './routes/health.routes.js';
import noteRoutes from './routes/note.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import practiceRoutes from './routes/practice.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import cronRoutes from './routes/cron.routes.js';

export function createApp() {
  const app = express();

  // Behind a proxy (Railway/Render/Fly) — trust X-Forwarded-* for correct IPs.
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(compression());
  app.use(
    cors({
      origin: corsOrigins.length ? corsOrigins : true,
      credentials: true,
    }),
  );
  app.use(httpLogger);
  app.use(express.json({ limit: '1mb' }));

  // Populates req.auth from the Bearer token / Clerk cookie.
  app.use(clerk);

  // Public health check (no auth, no rate limit).
  app.use('/health', healthRoutes);

  // Network-level protection for the whole API surface.
  app.use('/api', apiRateLimiter);

  app.use('/api/notes', noteRoutes);
  app.use('/api/analyze', analysisRoutes);
  app.use('/api/practice', practiceRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/cron', cronRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

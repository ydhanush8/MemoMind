import { pinoHttp } from 'pino-http';
import type { IncomingMessage } from 'node:http';
import { logger } from '../utils/logger.js';

export const httpLogger = pinoHttp({
  logger,
  // Keep health-check noise out of the logs.
  autoLogging: {
    ignore: (req: IncomingMessage) => req.url === '/health',
  },
});

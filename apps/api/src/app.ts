import express, { type Express } from 'express';
import type { Logger } from 'pino';
import type { Env } from './config/env';
import { docsRouter } from './docs/router';
import { errorHandler } from './middleware/errorHandler';
import { httpLogger } from './middleware/httpLogger';
import { notFoundHandler } from './middleware/notFound';
import { apiRateLimiter } from './middleware/rateLimit';
import { corsPolicy, securityHeaders } from './middleware/security';
import { createApiRouter, type ApiDependencies } from './routes';

export interface AppOptions extends ApiDependencies {
  env: Env;
  logger: Logger;
}

/** Builds the Express app without binding a port, so tests can drive it with Supertest. */
export function createApp({ env, logger, ...deps }: AppOptions): Express {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  app.use(httpLogger(logger));
  app.use(securityHeaders());
  app.use(corsPolicy(env));
  app.use(express.json({ limit: '100kb' }));

  if (env.apiDocsEnabled) app.use('/api/docs', docsRouter(env.APP_VERSION));
  app.use('/api', apiRateLimiter(env), createApiRouter(deps));

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}

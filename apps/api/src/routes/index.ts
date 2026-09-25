import { Router } from 'express';
import type { HealthService } from '../services/health.service';
import { healthRoutes } from './health.routes';

export interface ApiDependencies {
  health: HealthService;
}

/** Mounts every module router under `/api`. New modules register here. */
export function createApiRouter(deps: ApiDependencies): Router {
  const router = Router();
  router.use('/health', healthRoutes(deps.health));
  return router;
}

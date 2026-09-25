import { rateLimit } from 'express-rate-limit';
import type { Env } from '../config/env';
import { RateLimitError } from '../utils/errors';

/**
 * Global per-IP limiter for the API. Uses the in-memory store in Phase 1; Phase 2 moves
 * limits to Redis so they hold across API replicas and adds stricter per-route limits
 * (OTP, login).
 */
export function apiRateLimiter(env: Pick<Env, 'RATE_LIMIT_WINDOW_MS' | 'RATE_LIMIT_MAX'>) {
  return rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    limit: env.RATE_LIMIT_MAX,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: (req) => req.path.startsWith('/health'),
    handler: (_req, _res, next) => next(new RateLimitError()),
  });
}

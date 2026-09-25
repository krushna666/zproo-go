import { pino } from 'pino';
import { createApp } from '../src/app';
import { parseEnv } from '../src/config/env';
import { HealthService, type DependencyCheck } from '../src/services/health.service';

export const baseEnv = {
  NODE_ENV: 'test',
  DATABASE_URL: 'postgresql://test:test@localhost:5432/test',
  REDIS_URL: 'redis://localhost:6379',
  FRONTEND_URL: 'http://localhost:5173',
};

export const up = (name: string): DependencyCheck => ({ name, check: async () => {} });
export const down = (name: string, message = 'connection refused'): DependencyCheck => ({
  name,
  check: async () => {
    throw new Error(message);
  },
});

export function buildTestApp(
  options: { checks?: DependencyCheck[]; env?: Record<string, string> } = {},
) {
  const env = parseEnv({ ...baseEnv, ...options.env });
  const health = new HealthService(
    options.checks ?? [up('database'), up('redis')],
    env.APP_VERSION,
    200,
  );
  return createApp({ env, logger: pino({ level: 'silent' }), health });
}

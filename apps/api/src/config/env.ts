import path from 'node:path';
import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

const booleanString = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1');

const postgresUrl = z
  .string()
  .regex(/^postgres(ql)?:\/\//, 'must be a postgres:// or postgresql:// connection string');

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().min(1).max(65535).default(5000),
    APP_VERSION: z.string().default('0.1.0'),
    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),

    DATABASE_URL: postgresUrl,
    DIRECT_DATABASE_URL: postgresUrl.optional(),
    REDIS_URL: z.string().regex(/^rediss?:\/\//, 'must be a redis:// or rediss:// URL'),

    FRONTEND_URL: z.url().default('http://localhost:5173'),
    /** Comma-separated list of allowed browser origins. Defaults to FRONTEND_URL. */
    CORS_ORIGINS: z.string().optional(),
    /** Number of reverse proxies in front of the API (for correct client IPs). */
    TRUST_PROXY: z.coerce.number().int().min(0).max(10).default(0),
    RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),
    RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
    ENABLE_API_DOCS: booleanString.optional(),

    // Used from Phase 2 (authentication). Required in production.
    JWT_SECRET: z.string().min(32, 'must be at least 32 characters').optional(),
    JWT_REFRESH_SECRET: z.string().min(32, 'must be at least 32 characters').optional(),
  })
  .superRefine((env, ctx) => {
    if (env.NODE_ENV !== 'production') return;
    for (const key of ['JWT_SECRET', 'JWT_REFRESH_SECRET'] as const) {
      if (!env[key])
        ctx.addIssue({ code: 'custom', path: [key], message: 'is required in production' });
    }
    if (env.JWT_SECRET && env.JWT_SECRET === env.JWT_REFRESH_SECRET) {
      ctx.addIssue({
        code: 'custom',
        path: ['JWT_REFRESH_SECRET'],
        message: 'must differ from JWT_SECRET',
      });
    }
  })
  .transform((env) => ({
    ...env,
    corsOrigins: (env.CORS_ORIGINS ?? env.FRONTEND_URL)
      .split(',')
      .map((origin) => origin.trim().replace(/\/$/, ''))
      .filter(Boolean),
    apiDocsEnabled: env.ENABLE_API_DOCS ?? env.NODE_ENV !== 'production',
    isProduction: env.NODE_ENV === 'production',
  }));

export type Env = z.infer<typeof envSchema>;

/**
 * Validates environment variables. The error lists variable names and problems only —
 * never values, which may be secrets.
 */
export function parseEnv(source: NodeJS.ProcessEnv): Env {
  // `KEY=` in a .env file means "not set", not an empty value.
  const defined = Object.fromEntries(Object.entries(source).filter(([, value]) => value !== ''));
  const result = envSchema.safeParse(defined);
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${problems}`);
  }
  return result.data;
}

/** Loads `.env` from the API directory or the monorepo root (first match wins per key). */
export function loadEnvFiles(cwd: string = process.cwd()): void {
  if (process.env.NODE_ENV === 'test') return;
  loadDotenv({ path: [path.resolve(cwd, '.env'), path.resolve(cwd, '../../.env')], quiet: true });
}

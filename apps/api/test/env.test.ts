import { describe, expect, it } from 'vitest';
import { parseEnv } from '../src/config/env';
import { baseEnv } from './helpers';

const secret = 'a'.repeat(32);
const otherSecret = 'b'.repeat(32);

describe('parseEnv', () => {
  it('applies defaults', () => {
    const env = parseEnv({ ...baseEnv, NODE_ENV: 'development' });
    expect(env.PORT).toBe(5000);
    expect(env.corsOrigins).toEqual(['http://localhost:5173']);
    expect(env.apiDocsEnabled).toBe(true);
  });

  it('parses a CORS allowlist and strips trailing slashes', () => {
    const env = parseEnv({
      ...baseEnv,
      CORS_ORIGINS: 'https://zproogo.com/, https://admin.zproogo.com',
    });
    expect(env.corsOrigins).toEqual(['https://zproogo.com', 'https://admin.zproogo.com']);
  });

  it('rejects a non-postgres DATABASE_URL without echoing the value', () => {
    expect(() => parseEnv({ ...baseEnv, DATABASE_URL: 'mysql://user:hunter2@db/x' })).toThrow(
      /DATABASE_URL: must be a postgres/,
    );
    expect(() => parseEnv({ ...baseEnv, DATABASE_URL: 'mysql://user:hunter2@db/x' })).not.toThrow(
      /hunter2/,
    );
  });

  it('requires distinct JWT secrets in production', () => {
    expect(() => parseEnv({ ...baseEnv, NODE_ENV: 'production' })).toThrow(
      /JWT_SECRET: is required in production/,
    );
    expect(() =>
      parseEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        JWT_SECRET: secret,
        JWT_REFRESH_SECRET: secret,
      }),
    ).toThrow(/must differ/);
    const env = parseEnv({
      ...baseEnv,
      NODE_ENV: 'production',
      JWT_SECRET: secret,
      JWT_REFRESH_SECRET: otherSecret,
    });
    expect(env.apiDocsEnabled).toBe(false);
  });

  it('treats empty values (KEY= in .env) as unset', () => {
    const env = parseEnv({ ...baseEnv, JWT_SECRET: '', PORT: '', CORS_ORIGINS: '' });
    expect(env.JWT_SECRET).toBeUndefined();
    expect(env.PORT).toBe(5000);
    expect(env.corsOrigins).toEqual(['http://localhost:5173']);
  });

  it('rejects short secrets', () => {
    expect(() => parseEnv({ ...baseEnv, JWT_SECRET: 'short' })).toThrow(/at least 32/);
  });
});

import { RoleName as DbRoleName, UserStatus as DbUserStatus } from '@prisma/client';
import { RoleName, UserStatus } from '@zproo/types';
import { describe, expect, it } from 'vitest';

/** Shared enums must match the database enums exactly, or clients and API will disagree. */
describe('shared enums match Prisma enums', () => {
  it.each([
    ['RoleName', RoleName, DbRoleName],
    ['UserStatus', UserStatus, DbUserStatus],
  ])('%s', (_name, shared, db) => {
    expect(Object.values(shared).sort()).toEqual(Object.values(db).sort());
  });
});

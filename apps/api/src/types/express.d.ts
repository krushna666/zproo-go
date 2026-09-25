import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** Input parsed by the `validate()` middleware. */
    validated?: { body?: unknown; query?: unknown; params?: unknown };
  }
}

/**
 * API configuration.
 *
 * The app talks to the backend only through `src/api/services.ts`.
 * While USE_MOCK is true every request is answered by the in-app mock server
 * (src/api/mock/server.ts), so the app works fully offline.
 *
 * To connect the real Zproo backend:
 *   1. Set USE_MOCK to false.
 *   2. Set BASE_URL to your API root, e.g. "https://api.zproo.com/v1".
 *   3. Make the backend return the shapes defined in src/api/types.ts
 *      for the endpoints listed in API.md (or adapt services.ts).
 */
export const API_CONFIG = {
  USE_MOCK: true,
  BASE_URL: 'https://api.zproo.com/v1',
  TIMEOUT_MS: 20000,
  MOCK_LATENCY_MS: 650,
};

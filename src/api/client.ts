import { API_CONFIG } from './config';
import { mockServer } from './mock/server';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 0) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function request<T>(method: Method, path: string, body?: unknown): Promise<T> {
  if (API_CONFIG.USE_MOCK) {
    await new Promise((r) => setTimeout(r, API_CONFIG.MOCK_LATENCY_MS * (0.6 + Math.random() * 0.8)));
    try {
      return (await mockServer(method, path, body)) as T;
    } catch (e: any) {
      throw new ApiError(e?.message ?? 'Something went wrong', e?.status ?? 400);
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT_MS);
  try {
    const res = await fetch(`${API_CONFIG.BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status);
    }
    return data as T;
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    if (e?.name === 'AbortError') throw new ApiError('The request timed out. Check your connection.');
    throw new ApiError('Unable to reach Zproo servers. Check your internet connection.');
  } finally {
    clearTimeout(timer);
  }
}

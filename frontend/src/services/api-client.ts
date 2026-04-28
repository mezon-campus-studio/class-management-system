import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api/v1';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── In-memory access token ───────────────────────────────────────────────────

let _accessToken: string | null = null;

export const memToken = {
  get: () => _accessToken,
  set: (t: string | null) => { _accessToken = t; },
  clear: () => { _accessToken = null; },
};

// ─── Client-ID binding ────────────────────────────────────────────────────────
// A random UUID persisted in localStorage. Not sensitive on its own —
// only useful combined with the HttpOnly refresh cookie.
// Protects against stolen cookies (e.g. network sniffing without HTTPS).

const CLIENT_ID_KEY = 'ch_cid';

export function getClientId(): string {
  let id = localStorage.getItem(CLIENT_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(CLIENT_ID_KEY, id);
  }
  return id;
}

// ─── Shared refresh function ──────────────────────────────────────────────────
// Called by: proactive timer, visibilitychange handler, 401 interceptor.

export async function refreshAccessToken(): Promise<string> {
  const res = await axios.post(
    `${BASE_URL}/auth/refresh`,
    null,
    {
      withCredentials: true,
      headers: { 'X-Client-Id': getClientId() },
      validateStatus: () => true, // don't throw on 4xx
    },
  );
  const token: string | undefined = res.data?.data?.accessToken;
  if (!token) throw new Error('refresh_failed');
  memToken.set(token);
  return token;
}

// ─── Request interceptor — attach access token + client-id ───────────────────

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (_accessToken) config.headers.Authorization = `Bearer ${_accessToken}`;
  config.headers['X-Client-Id'] = getClientId();
  return config;
});

// ─── Response interceptor — transparent refresh on 401 ───────────────────────

let isRefreshing = false;
let waitQueue: Array<{ resolve: (t: string) => void; reject: (e: unknown) => void }> = [];

function drainQueue(error: unknown, token: string | null) {
  waitQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token!)));
  waitQueue = [];
}

// Auth endpoints return 401 for business reasons (wrong password, expired token, etc.)
// and must never trigger a refresh loop.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'];
const isAuthEndpoint = (url?: string) => AUTH_PATHS.some((p) => url?.includes(p));

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry || isAuthEndpoint(original.url)) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        waitQueue.push({ resolve, reject });
      }).then((token) => {
        original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const token = await refreshAccessToken();
      drainQueue(null, token);
      original.headers = { ...original.headers, Authorization: `Bearer ${token}` };
      return api(original);
    } catch (refreshError) {
      drainQueue(refreshError, null);
      memToken.clear();
      window.location.href = '/login';
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

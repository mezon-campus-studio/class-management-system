import { create } from 'zustand';
import { api, memToken, refreshAccessToken, getClientId } from '@/services/api-client';

export type UserType = 'STUDENT' | 'TEACHER' | 'PARENT' | 'SYSTEM_ADMIN';

export interface UserInfo {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  userType: UserType;
  studentCode?: string | null;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    displayName: string,
    userType: UserType,
    extras?: { studentCode?: string; relationship?: string },
  ) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  updateProfile: (displayName: string, avatarUrl?: string | null) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
}

// ─── Proactive refresh timer ──────────────────────────────────────────────────

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

/** Decode JWT exp claim without verifying signature (safe — we trust our own backend). */
function parseJwtExpMs(token: string): number | null {
  try {
    const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(b64)) as { exp?: number };
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/**
 * Schedule a silent token refresh 4 minutes before the access token expires.
 * On success the timer is rescheduled for the new token.
 * On failure the 401 interceptor acts as the safety net.
 */
function scheduleProactiveRefresh(accessToken: string) {
  if (proactiveTimer) clearTimeout(proactiveTimer);

  const expMs = parseJwtExpMs(accessToken);
  if (!expMs) return;

  const delay = expMs - Date.now() - 4 * 60 * 1000; // fire 4 min before expiry

  proactiveTimer = setTimeout(async () => {
    try {
      const newToken = await refreshAccessToken();
      scheduleProactiveRefresh(newToken);
    } catch {
      // Refresh failed — 401 interceptor will handle the next API call
    }
  }, Math.max(0, delay));
}

// ─── Tab visibility — refresh eagerly when tab becomes active ─────────────────

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', async () => {
    if (document.visibilityState !== 'visible') return;
    const token = memToken.get();
    if (!token) return;
    const expMs = parseJwtExpMs(token);
    if (!expMs) return;
    // Refresh if less than 5 minutes remaining
    if (expMs - Date.now() < 5 * 60 * 1000) {
      try {
        const newToken = await refreshAccessToken();
        scheduleProactiveRefresh(newToken);
      } catch { /* 401 interceptor handles it */ }
    }
  });
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await refreshAccessToken();
      // Fetch user info with the fresh access token
      const { data } = await api.get<{ data: UserInfo }>('/auth/me');
      scheduleProactiveRefresh(token);
      set({ user: data.data, isAuthenticated: true, isInitialized: true });
    } catch {
      memToken.clear();
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post<{ data: { accessToken: string; user: UserInfo } }>(
      '/auth/login',
      { email, password },
      { headers: { 'X-Client-Id': getClientId() } },
    );
    memToken.set(data.data.accessToken);
    scheduleProactiveRefresh(data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  register: async (email, password, displayName, userType, extras) => {
    const { data } = await api.post<{ data: { accessToken: string; user: UserInfo } }>(
      '/auth/register',
      { email, password, displayName, userType, ...(extras ?? {}) },
      { headers: { 'X-Client-Id': getClientId() } },
    );
    memToken.set(data.data.accessToken);
    scheduleProactiveRefresh(data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
  },

  logout: async () => {
    if (proactiveTimer) { clearTimeout(proactiveTimer); proactiveTimer = null; }
    try { await api.post('/auth/logout'); } catch { /* ignore */ }
    memToken.clear();
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (displayName, avatarUrl) => {
    const body: { displayName: string; avatarUrl?: string | null } = { displayName };
    if (avatarUrl !== undefined) body.avatarUrl = avatarUrl;
    const { data } = await api.put<{ data: UserInfo }>('/auth/me', body);
    set((s) => ({ user: s.user ? { ...s.user, ...data.data } : s.user }));
  },

  uploadAvatar: async (file) => {
    const form = new FormData();
    form.append('file', file);
    const { data } = await api.post<{ data: UserInfo }>('/auth/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    set((s) => ({ user: s.user ? { ...s.user, ...data.data } : s.user }));
  },
}));

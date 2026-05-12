import { fetchWithRetry } from "@/lib/fetchWithRetry";

// API base for direct calls (authenticated POSTs, /me/solves, etc.)
// Falls back to env-injected origin in production; localhost for dev.
const DIRECT_API_BASE =
  import.meta.env.VITE_CTFD_DIRECT_BASE ?? "https://api.ctf.chron0.tech";
const CTFD_WEB_BASE =
  import.meta.env.VITE_CTFD_WEB_BASE ?? "https://api.ctf.chron0.tech";

// Proxy base — same-origin, hits api/[...path].ts
const PROXY_BASE = "/api";

// Default request timeout. Long enough for slow networks, short enough that
// a hung request doesn't leave the UI stuck in a loading state forever.
// Firefox Strict's cross-site cookie partitioning can cause some auth fetches
// to hang rather than fail cleanly — the timeout converts those into errors
// the SPA can handle gracefully.
const DEFAULT_TIMEOUT_MS = 8000;

const TOKEN_KEY = "ctfd_bearer";
const TOKEN_CLEARED_AT_KEY = "ctfd_bearer_cleared_at";
const PROXIED_DIRECT_GET_PATHS = [
  /^\/users\/me$/,
  /^\/users\/me\/solves$/,
  /^\/challenges\/\d+$/,
  /^\/challenges\/\d+\/hints$/,
  /^\/hints\/\d+$/,
];

/**
 * Wrap a fetch in an AbortController-backed timeout. Resolves to the Response
 * if the fetch completes in time, throws "Request timed out" otherwise.
 *
 * Browsers occasionally hang fetches indefinitely (especially under strict
 * privacy modes that block credentials silently). Without a timeout the SPA
 * sits in a "loading" state forever; with one, we surface a real error and
 * the calling code can recover.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms: ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * localStorage / sessionStorage access can throw under Firefox Total Cookie
 * Protection or in private browsing modes where storage is denied. Wrap reads
 * and writes so a denied storage doesn't crash the SPA — we just behave as if
 * no token was stored.
 */
function safeLocalGet(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeLocalSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* storage access denied — silently drop */
  }
}

function safeLocalRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* storage access denied — silently drop */
  }
}

function safeSessionGet(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeSessionRemove(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    /* storage access denied — silently drop */
  }
}

function readPersistedToken(): string | null {
  const localToken = safeLocalGet(TOKEN_KEY);
  if (localToken) return localToken;

  // Backward compatible migration from older session-only storage.
  const sessionToken = safeSessionGet(TOKEN_KEY);
  if (!sessionToken) return null;

  // If logout happened in another tab, never restore from stale session storage.
  const clearedAt = safeLocalGet(TOKEN_CLEARED_AT_KEY);
  if (clearedAt) {
    safeSessionRemove(TOKEN_KEY);
    return null;
  }

  if (sessionToken) {
    safeLocalSet(TOKEN_KEY, sessionToken);
    safeSessionRemove(TOKEN_KEY);
    return sessionToken;
  }
  return null;
}

export function getBearerToken(): string | null {
  return readPersistedToken();
}

export function setBearerToken(token: string): void {
  safeLocalSet(TOKEN_KEY, token);
  safeLocalRemove(TOKEN_CLEARED_AT_KEY);
  safeSessionRemove(TOKEN_KEY);
}

export function clearBearerToken(): void {
  safeLocalRemove(TOKEN_KEY);
  safeLocalSet(TOKEN_CLEARED_AT_KEY, String(Date.now()));
  safeSessionRemove(TOKEN_KEY);
}

// Public reads via the Vercel proxy (no auth needed)
export async function proxyGet<T = unknown>(path: string): Promise<T> {
  const url = `${PROXY_BASE}${path}`;
  const res = await fetchWithRetry(url);
  if (!res.ok) {
    throw new Error(`Proxy GET ${path} failed: HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// Authenticated reads/writes — direct to CTFd, bearer token
export async function directGet<T = unknown>(path: string): Promise<T> {
  const token = getBearerToken();
  if (!token) throw new Error("Not authenticated");
  if (PROXIED_DIRECT_GET_PATHS.some((re) => re.test(path))) {
    const res = await fetchWithTimeout(`${PROXY_BASE}/v1${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (res.status === 401) {
      clearBearerToken();
      throw new Error("Session expired");
    }
    if (!res.ok) throw new Error(`Direct GET ${path}: HTTP ${res.status}`);
    return res.json() as Promise<T>;
  }
  const res = await fetchWithTimeout(`${DIRECT_API_BASE}/api/v1${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
  });
  if (res.status === 401) {
    clearBearerToken();
    throw new Error("Session expired");
  }
  if (!res.ok) throw new Error(`Direct GET ${path}: HTTP ${res.status}`);
  return res.json() as Promise<T>;
}

export async function directPost<T = unknown>(
  path: string,
  body: unknown,
  options?: { headers?: Record<string, string> },
): Promise<T> {
  const token = getBearerToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetchWithTimeout(`${DIRECT_API_BASE}/api/v1${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (res.status === 401) {
    clearBearerToken();
    throw new Error("Session expired");
  }
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Direct POST ${path}: HTTP ${res.status} ${txt}`);
  }
  return res.json() as Promise<T>;
}

// Login / token minting
// CTFd's /api/v1/tokens endpoint requires an authenticated session (cookie).
// Flow: user redirects to https://ctf.chron0.tech/login -> auth flow -> CTFd sets session cookie on .chron0.tech.
// SPA then POSTs /api/v1/tokens with credentials: 'include' to mint a bearer.
export async function mintBearerFromSession(): Promise<string> {
  const res = await fetchWithTimeout(`${DIRECT_API_BASE}/api/v1/tokens`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ description: "spa-session" }),
  });
  if (!res.ok) {
    throw new Error(`Token mint failed: HTTP ${res.status}`);
  }
  const json = (await res.json()) as {
    success: boolean;
    data: { value: string };
  };
  if (!json.success || !json.data?.value) {
    throw new Error("Token mint: bad response shape");
  }
  setBearerToken(json.data.value);
  return json.data.value;
}

export function loginUrl(returnTo: string = "/"): string {
  // After successful auth, redirect back to /auth/callback?next=<returnTo>
  const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(returnTo)}`;
  return `${CTFD_WEB_BASE}/login?next=${encodeURIComponent(callback)}`;
}

export async function logout(): Promise<void> {
  clearBearerToken();
  // Best-effort: invalidate the CTFd session (no timeout — we don't care about
  // the response, we're about to navigate anyway).
  try {
    await fetch(`${DIRECT_API_BASE}/logout`, { credentials: "include" });
  } catch {
    // ignore
  }
}

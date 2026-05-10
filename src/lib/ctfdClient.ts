import { fetchWithRetry } from "@/lib/fetchWithRetry";

// API base for direct calls (authenticated POSTs, /me/solves, etc.)
// Falls back to env-injected origin in production; localhost for dev.
const DIRECT_API_BASE =
  import.meta.env.VITE_CTFD_DIRECT_BASE ?? "https://api.ctf.chron0.tech";
const CTFD_WEB_BASE =
  import.meta.env.VITE_CTFD_WEB_BASE ?? "https://api.ctf.chron0.tech";

// Proxy base — same-origin, hits api/[...path].ts
const PROXY_BASE = "/api";

const TOKEN_KEY = "ctfd_bearer";

export function getBearerToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setBearerToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearBearerToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
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
  const res = await fetch(`${DIRECT_API_BASE}/api/v1${path}`, {
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
  const res = await fetch(`${DIRECT_API_BASE}/api/v1${path}`, {
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
  const res = await fetch(`${DIRECT_API_BASE}/api/v1/tokens`, {
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
  // Best-effort: invalidate the CTFd session
  try {
    await fetch(`${DIRECT_API_BASE}/logout`, { credentials: "include" });
  } catch {
    // ignore
  }
}

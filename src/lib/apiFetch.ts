/**
 * Centralized fetch wrapper for all /api/* calls.
 * Injects the X-API-Key header from the build-time env var VITE_API_PROXY_SECRET.
 * If the env var is not set, requests are sent without the header (server will
 * skip the check if API_PROXY_SECRET is also unset).
 */
const API_KEY = import.meta.env.VITE_API_PROXY_SECRET ?? "";

export function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  if (API_KEY) {
    headers.set("X-API-Key", API_KEY);
  }
  return fetch(input, { ...init, headers });
}

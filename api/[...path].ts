const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

// ── Allowed hosts — validated via Vercel's x-forwarded-host header ──
// Vercel edge overwrites x-forwarded-host so it can't be forged by external callers.
// This is the primary security gate (not Origin, which browsers omit on same-origin).
const ALLOWED_HOSTS: (string | RegExp)[] = [
  "iss-ctfd-live-scoreboard.vercel.app",
  /^iss-ctfd-live-scoreboard-.*\.vercel\.app$/,
  "localhost:8000",
  "localhost",
];

// Secondary: Origin allowlist for CORS cross-origin requests
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  "https://iss-ctfd-live-scoreboard.vercel.app",
  /^https:\/\/iss-ctfd-live-scoreboard-.*\.vercel\.app$/,
  "http://localhost:8000",
];

// Allowlist of CTFd API paths the frontend actually needs (read-only).
// /v1/users/:id is intentionally excluded — access is gated by seen-member allowlist below.
const ALLOWED_PATHS = [
  /^v1\/scoreboard(\/top\/\d+)?$/,
  /^v1\/teams$/,
  /^v1\/teams\/\d+$/,
  /^v1\/teams\/\d+\/solves$/,
  /^v1\/teams\/\d+\/members$/,
  /^v1\/challenges$/,
  /^v1\/challenges\/\d+$/,
  /^v1\/submissions\/\d+$/,
];

// User paths handled separately with member-ID allowlist enforcement
const USER_PATH_RE = /^v1\/users\/(\d+)(\/solves)?$/;

// ── Seen-member-ID allowlist ──
// Populated server-side whenever a /v1/teams/:id response passes through.
// Only user IDs that appear as team members are allowed through /v1/users/:id.
const seenMemberIds = new Set<number>();

function recordTeamMembers(data: unknown): void {
  if (!data || typeof data !== "object" || !("data" in data)) return;
  const d = (data as { data: unknown }).data;
  if (!d || typeof d !== "object") return;
  const team = d as Record<string, unknown>;

  // Record all listed members
  if (Array.isArray(team.members)) {
    for (const id of team.members as unknown[]) {
      if (typeof id === "number") seenMemberIds.add(id);
    }
  }

  // Also record captain_id — solo players may have an empty members array
  // but still have a valid captain_id
  if (typeof team.captain_id === "number") {
    seenMemberIds.add(team.captain_id);
  }
}

// Sensitive fields to strip from /v1/users/:id responses
const USER_SENSITIVE_FIELDS = ["email", "password", "secret", "token", "oauth_id"];

function stripSensitiveUserFields(data: unknown): unknown {
  if (!data || typeof data !== "object") return data;
  const d = data as Record<string, unknown>;
  if (d.data && typeof d.data === "object") {
    const user = { ...(d.data as Record<string, unknown>) };
    for (const field of USER_SENSITIVE_FIELDS) delete user[field];
    return { ...d, data: user };
  }
  return data;
}

// ── IP-based token bucket rate limiter (in-memory, per serverless instance) ──
const RATE_LIMIT_MAX = 60;           // max tokens (requests) per window
const RATE_LIMIT_WINDOW_MS = 60_000; // 1-minute window
const RATE_LIMIT_CLEANUP_MS = 120_000; // purge stale entries every 2 min

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
let lastCleanup = Date.now();

function getClientIP(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();

  // Periodic cleanup of stale buckets
  if (now - lastCleanup > RATE_LIMIT_CLEANUP_MS) {
    for (const [key, bucket] of buckets) {
      if (now - bucket.lastRefill > RATE_LIMIT_WINDOW_MS * 2) buckets.delete(key);
    }
    lastCleanup = now;
  }

  let bucket = buckets.get(ip);
  if (!bucket) {
    bucket = { tokens: RATE_LIMIT_MAX, lastRefill: now };
    buckets.set(ip, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor((elapsed / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_MAX);
  if (refill > 0) {
    bucket.tokens = Math.min(RATE_LIMIT_MAX, bucket.tokens + refill);
    bucket.lastRefill = now;
  }

  if (bucket.tokens <= 0) return true;
  bucket.tokens--;
  return false;
}

function isHostAllowed(host: string | null): boolean {
  if (!host) return false;
  return ALLOWED_HOSTS.some((h) =>
    typeof h === "string" ? h === host : h.test(host),
  );
}

function isOriginAllowed(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some((o) =>
    typeof o === "string" ? o === origin : o.test(origin),
  );
}

function isPathAllowed(apiPath: string): boolean {
  return ALLOWED_PATHS.some((pattern) => pattern.test(apiPath));
}

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = isOriginAllowed(origin);
  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

export default {
  async fetch(request: Request) {
    const origin = request.headers.get("Origin");

    // Handle CORS preflight — only check Origin (browser always sends it for preflight)
    if (request.method === "OPTIONS") {
      if (!isOriginAllowed(origin)) {
        return Response.json({ error: "Origin not allowed" }, { status: 403 });
      }
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only allow GET — this proxy is read-only
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders(origin) },
      );
    }

    // ── Primary gate: Vercel edge host validation ──
    // Vercel overwrites x-forwarded-host at the edge — external callers can't forge it.
    // Same-origin browser requests don't send Origin, but always have the correct host.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    if (!isHostAllowed(forwardedHost) && !isHostAllowed(host)) {
      if (origin && isOriginAllowed(origin)) {
        // Cross-origin from an allowed origin — permit
      } else {
        return Response.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // IP-based rate limiting
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return Response.json(
        { error: "Too many requests" },
        { status: 429, headers: { ...corsHeaders(origin), "Retry-After": "60" } },
      );
    }

    const token = process.env.CTFD_API_TOKEN;
    if (!token) {
      return Response.json(
        { error: "CTFD_API_TOKEN is not configured" },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    // Extract path from URL: /api/v1/teams -> v1/teams
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const apiPath = pathParts.slice(1).join("/"); // Remove "api" prefix

    // ── User endpoint: enforce seen-member-ID allowlist ──
    const userMatch = USER_PATH_RE.exec(apiPath);
    if (userMatch) {
      const requestedId = parseInt(userMatch[1], 10);
      if (!seenMemberIds.has(requestedId)) {
        return Response.json(
          { error: "Endpoint not allowed" },
          { status: 403, headers: corsHeaders(origin) },
        );
      }
    } else if (!isPathAllowed(apiPath)) {
      // Enforce general endpoint allowlist
      return Response.json(
        { error: "Endpoint not allowed" },
        { status: 403, headers: corsHeaders(origin) },
      );
    }

    const targetUrl = `${CTFD_BASE_URL}/api/${apiPath}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
      });

      let data = await response.json();

      // Populate seen-member-ID allowlist from team detail responses
      if (/^v1\/teams\/\d+$/.test(apiPath)) {
        recordTeamMembers(data);
      }

      // Strip sensitive fields from user profile responses
      if (userMatch && !userMatch[2]) {
        data = stripSensitiveUserFields(data);
      }

      return Response.json(data, {
        status: response.status,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      });
    } catch (err) {
      console.error("CTFd proxy error:", err);
      return Response.json(
        { error: "Failed to reach CTFd API" },
        { status: 502, headers: corsHeaders(origin) },
      );
    }
  },
};

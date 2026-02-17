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

// Allowlist of CTFd API paths the frontend actually needs (read-only)
const ALLOWED_PATHS = [
  /^v1\/scoreboard(\/top\/\d+)?$/,
  /^v1\/teams$/,
  /^v1\/teams\/\d+$/,
  /^v1\/teams\/\d+\/solves$/,
  /^v1\/teams\/\d+\/members$/,
  /^v1\/challenges$/,
  /^v1\/challenges\/\d+$/,
  /^v1\/users\/\d+$/,
  /^v1\/users\/\d+\/solves$/,
  /^v1\/submissions\/\d+$/,
];

// ── IP-based token bucket rate limiter (in-memory, per serverless instance) ──
const RATE_LIMIT_MAX = 60;        // max tokens (requests) per window
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
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
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

    // ── Authentication: server-validated shared secret (required) ──
    // Every request must include X-API-Key matching API_PROXY_SECRET env var.
    // This is the primary auth gate — host/Origin checks are defense-in-depth.
    const proxySecret = process.env.API_PROXY_SECRET;
    if (!proxySecret) {
      return Response.json(
        { error: "API_PROXY_SECRET is not configured" },
        { status: 500, headers: corsHeaders(origin) },
      );
    }
    const clientKey = request.headers.get("X-API-Key");
    if (!clientKey || clientKey !== proxySecret) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeaders(origin) },
      );
    }

    // ── Defense-in-depth: Vercel edge host validation ──
    // Vercel overwrites x-forwarded-host at the edge — external callers can't forge it.
    // Same-origin browser requests don't send Origin, but always have the correct host.
    const forwardedHost = request.headers.get("x-forwarded-host");
    const host = request.headers.get("host");
    if (!isHostAllowed(forwardedHost) && !isHostAllowed(host)) {
      // If Origin is present (cross-origin), check it as secondary
      if (origin && isOriginAllowed(origin)) {
        // Cross-origin from an allowed origin — permit
      } else {
        return Response.json(
          { error: "Forbidden" },
          { status: 403 },
        );
      }
    }

    // IP-based rate limiting
    const clientIP = getClientIP(request);
    if (isRateLimited(clientIP)) {
      return Response.json(
        { error: "Too many requests" },
        {
          status: 429,
          headers: {
            ...corsHeaders(origin),
            "Retry-After": "60",
          },
        },
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

    // Enforce endpoint allowlist
    if (!isPathAllowed(apiPath)) {
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

      const data = await response.json();

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

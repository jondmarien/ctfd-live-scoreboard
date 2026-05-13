import { getLogger } from "../src/lib/logging";

const CTFD_BASE_URL =
  process.env.CTFD_BASE_URL ?? "https://api.ctf.chron0.tech";
const logger = getLogger("api:proxy");

// ── Allowed hosts — validated via Vercel's x-forwarded-host header ──
// Vercel edge overwrites x-forwarded-host so it can't be forged by external callers.
// This is the primary security gate (not Origin, which browsers omit on same-origin).
const ALLOWED_HOSTS: (string | RegExp)[] = [
  "ctf.chron0.tech",
  "scoreboard.chron0.tech",
  "iss-ctfd-live-scoreboard.vercel.app",
  /^iss-ctfd-live-scoreboard-.*\.vercel\.app$/,
  "localhost:8000",
  "localhost",
];

// Secondary: Origin allowlist for CORS cross-origin requests
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  "https://ctf.chron0.tech",
  "https://scoreboard.chron0.tech",
  "https://iss-ctfd-live-scoreboard.vercel.app",
  /^https:\/\/iss-ctfd-live-scoreboard-.*\.vercel\.app$/,
  "http://localhost:8000",
  "http://localhost:5173",
];

// Allowlist of CTFd API paths the frontend actually needs (read-only).
// /v1/users/:id is intentionally excluded — access is gated by seen-member allowlist below.
const ALLOWED_PATHS = [
  /^v1\/scoreboard(\/top\/\d+)?$/,
  /^v1\/teams$/,
  /^v1\/teams\/\d+$/,
  /^v1\/teams\/\d+\/solves$/,
  /^v1\/teams\/\d+\/members$/,
  /^v1\/users$/,
  /^v1\/users\/me$/,
  /^v1\/users\/me\/solves$/,
  /^v1\/challenges$/,
  /^v1\/challenges\/\d+$/,
  /^v1\/challenges\/\d+\/hints$/,
  /^v1\/challenges\/\d+\/solves$/,
  /^v1\/hints\/\d+$/,
  /^v1\/notifications$/,
  /^v1\/awards$/,
  /^v1\/statistics\/challenges\/solves(\/percentages)?$/,
];

// User paths handled separately with validation
const USER_PATH_RE = /^v1\/users\/(\d+)(\/(solves|awards))?$/;
const USER_ME_PATH_RE = /^v1\/users\/me$/;
const USER_ME_SOLVES_PATH_RE = /^v1\/users\/me\/solves$/;
const USER_ID_SOLVES_PATH_RE = /^v1\/users\/\d+\/solves$/;
const CLIENT_TOKEN_PATHS = [
  USER_ME_PATH_RE,
  USER_ME_SOLVES_PATH_RE,
  /^v1\/challenges\/\d+$/,
  /^v1\/challenges\/\d+\/hints$/,
  /^v1\/hints\/\d+$/,
];

const ENABLE_PROXY_DEBUG_LOGS = process.env.CTFD_PROXY_DEBUG === "1";

function logProxyDebug(event: string, data: Record<string, unknown>): void {
  if (!ENABLE_PROXY_DEBUG_LOGS) return;
  logger.debug("CTFd proxy debug event", {
    scope: "ctfd-proxy",
    event,
    ...data,
  });
}

function extractClientToken(authHeader: string | null): string | null {
  if (!authHeader) return null;
  const match = authHeader.match(/^(Bearer|Token)\s+(.+)$/i);
  if (!match) return null;
  return match[2].trim() || null;
}

// ── Server-side user validation ──
// Before proxying /v1/users/:id, fetch the user from CTFd and verify they
// exist and are not banned/hidden. Supports both team-mode (user has team_id)
// and user-mode (individual participants without teams).
async function isValidUser(userId: number, token: string): Promise<boolean> {
  try {
    const res = await fetch(`${CTFD_BASE_URL}/api/v1/users/${userId}`, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) return false;
    const json = (await res.json()) as {
      success?: boolean;
      data?: { banned?: boolean; hidden?: boolean };
    };
    // #region agent log
    fetch("http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7bb2c6",
      },
      body: JSON.stringify({
        sessionId: "7bb2c6",
        runId: "pre-fix",
        hypothesisId: "H5",
        location: "api/[...path].ts:isValidUser",
        message: "validated user visibility payload",
        data: {
          userId,
          ok: res.ok,
          success: json.success === true,
          dataKeys: json.data ? Object.keys(json.data) : [],
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion
    if (json.success !== true || !json.data) return false;
    return !json.data.banned && !json.data.hidden;
  } catch {
    return false;
  }
}

// Sensitive fields to strip from /v1/users/:id responses
const USER_SENSITIVE_FIELDS = [
  "email",
  "password",
  "secret",
  "token",
  "oauth_id",
];

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

function sanitizeSolveEntry(entry: unknown): Record<string, unknown> {
  if (!entry || typeof entry !== "object") return {};
  const solve = entry as Record<string, unknown>;
  const challenge =
    solve.challenge && typeof solve.challenge === "object"
      ? (solve.challenge as Record<string, unknown>)
      : null;

  const sanitized: Record<string, unknown> = {};
  if (typeof solve.id !== "undefined") sanitized.id = solve.id;
  if (typeof solve.challenge_id !== "undefined")
    sanitized.challenge_id = solve.challenge_id;
  if (typeof solve.type !== "undefined") sanitized.type = solve.type;
  if (typeof solve.date !== "undefined") sanitized.date = solve.date;
  if (challenge) {
    sanitized.challenge = {
      id: challenge.id,
      name: challenge.name,
      category: challenge.category,
      value: challenge.value,
      type: challenge.type,
    };
  }
  return sanitized;
}

function stripSensitiveSolveFields(payload: unknown): unknown {
  if (!payload || typeof payload !== "object") return payload;
  const root = payload as Record<string, unknown>;
  const responseData = root.data;

  if (Array.isArray(responseData)) {
    return {
      ...root,
      data: responseData.map((entry) => sanitizeSolveEntry(entry)),
    };
  }

  if (responseData && typeof responseData === "object") {
    return { ...root, data: sanitizeSolveEntry(responseData) };
  }

  return payload;
}

// ── IP-based token bucket rate limiter (in-memory, per serverless instance) ──
const RATE_LIMIT_MAX = 60; // max tokens (requests) per window
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
      if (now - bucket.lastRefill > RATE_LIMIT_WINDOW_MS * 2)
        buckets.delete(key);
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

function shouldUseClientToken(
  apiPath: string,
  hasClientToken: boolean,
): boolean {
  return (
    hasClientToken &&
    CLIENT_TOKEN_PATHS.some((pattern) => pattern.test(apiPath))
  );
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
        {
          status: 429,
          headers: { ...corsHeaders(origin), "Retry-After": "60" },
        },
      );
    }

    const serverToken = process.env.CTFD_API_TOKEN;
    if (!serverToken) {
      return Response.json(
        { error: "CTFD_API_TOKEN is not configured" },
        { status: 500, headers: corsHeaders(origin) },
      );
    }

    // Extract path from URL: /api/v1/teams -> v1/teams
    const url = new URL(request.url);
    const pathParts = url.pathname.split("/").filter(Boolean);
    const apiPath = pathParts.slice(1).join("/"); // Remove "api" prefix
    const clientToken = extractClientToken(
      request.headers.get("authorization"),
    );
    logProxyDebug("request.parsed", {
      method: request.method,
      apiPath,
      hasClientToken: !!clientToken,
    });
    // #region agent log
    fetch("http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7bb2c6",
      },
      body: JSON.stringify({
        sessionId: "7bb2c6",
        runId: "pre-fix",
        hypothesisId: "H2",
        location: "api/[...path].ts:request-parsed",
        message: "incoming API request path parsed",
        data: {
          method: request.method,
          apiPath,
          hasClientToken: !!clientToken,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    // ── User endpoint: validate team membership server-side ──
    const userMatch = USER_PATH_RE.exec(apiPath);
    if (userMatch) {
      const userSubPath = userMatch[3] ?? null;
      if (userSubPath === "solves" || USER_ID_SOLVES_PATH_RE.test(apiPath)) {
        logProxyDebug("route.blocked", {
          apiPath,
          reason: "numeric-user-solves-blocked",
        });
        return Response.json(
          { error: "Endpoint not allowed" },
          { status: 403, headers: corsHeaders(origin) },
        );
      }
      const requestedId = parseInt(userMatch[1], 10);
      // #region agent log
      fetch(
        "http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "7bb2c6",
          },
          body: JSON.stringify({
            sessionId: "7bb2c6",
            runId: "pre-fix",
            hypothesisId: "H1",
            location: "api/[...path].ts:user-endpoint-match",
            message: "user endpoint pattern matched",
            data: {
              requestedId,
              subPath: userMatch[3] ?? null,
              isBaseUserPath: !userMatch[2],
            },
            timestamp: Date.now(),
          }),
        },
      ).catch(() => {});
      // #endregion
      const allowed = await isValidUser(requestedId, serverToken);
      if (!allowed) {
        logProxyDebug("route.blocked", {
          apiPath,
          reason: "user-validation-failed",
          requestedId,
        });
        return Response.json(
          { error: "Endpoint not allowed" },
          { status: 403, headers: corsHeaders(origin) },
        );
      }
      logProxyDebug("route.allowed", {
        apiPath,
        requestedId,
        reason: "user-validation-passed",
      });
    } else if (!isPathAllowed(apiPath)) {
      // Enforce general endpoint allowlist
      logProxyDebug("route.blocked", {
        apiPath,
        reason: "path-not-allowlisted",
      });
      return Response.json(
        { error: "Endpoint not allowed" },
        { status: 403, headers: corsHeaders(origin) },
      );
    }

    const outboundToken = shouldUseClientToken(apiPath, !!clientToken)
      ? (clientToken as string)
      : serverToken;
    // #region agent log
    fetch("http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "7bb2c6",
      },
      body: JSON.stringify({
        sessionId: "7bb2c6",
        runId: "pre-fix",
        hypothesisId: "H4",
        location: "api/[...path].ts:outbound-token-choice",
        message: "selected outbound token source",
        data: {
          apiPath,
          usesClientToken: outboundToken !== serverToken,
          hasClientToken: !!clientToken,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    // #endregion

    const targetUrl = `${CTFD_BASE_URL}/api/${apiPath}${url.search}`;

    try {
      const response = await fetch(targetUrl, {
        method: "GET",
        headers: {
          Authorization: `Token ${outboundToken}`,
          "Content-Type": "application/json",
        },
      });

      let data = await response.json();
      if (userMatch) {
        const root = data as Record<string, unknown>;
        const responseData = root?.data;
        const listFirstItem =
          Array.isArray(responseData) && responseData.length > 0
            ? (responseData[0] as Record<string, unknown>)
            : null;
        // #region agent log
        fetch(
          "http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "7bb2c6",
            },
            body: JSON.stringify({
              sessionId: "7bb2c6",
              runId: "pre-fix",
              hypothesisId: "H1",
              location: "api/[...path].ts:user-response-shape",
              message: "observed user endpoint response shape",
              data: {
                apiPath,
                status: response.status,
                topLevelKeys:
                  data && typeof data === "object"
                    ? Object.keys(data as Record<string, unknown>)
                    : [],
                dataType: Array.isArray(responseData)
                  ? "array"
                  : typeof responseData,
                dataKeys:
                  responseData &&
                  typeof responseData === "object" &&
                  !Array.isArray(responseData)
                    ? Object.keys(responseData as Record<string, unknown>)
                    : [],
                firstItemKeys: listFirstItem ? Object.keys(listFirstItem) : [],
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }

      // Strip sensitive fields from user profile responses
      if (userMatch && !userMatch[2]) {
        data = stripSensitiveUserFields(data);
        const root = data as Record<string, unknown>;
        const sanitized = root?.data;
        // #region agent log
        fetch(
          "http://127.0.0.1:7769/ingest/a24d95a2-737a-46d2-8df1-240ca668cb60",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Debug-Session-Id": "7bb2c6",
            },
            body: JSON.stringify({
              sessionId: "7bb2c6",
              runId: "pre-fix",
              hypothesisId: "H3",
              location: "api/[...path].ts:user-response-sanitized",
              message: "applied base user response sanitization",
              data: {
                apiPath,
                sanitizedKeys:
                  sanitized && typeof sanitized === "object"
                    ? Object.keys(sanitized as Record<string, unknown>)
                    : [],
              },
              timestamp: Date.now(),
            }),
          },
        ).catch(() => {});
        // #endregion
      }

      if (USER_ME_SOLVES_PATH_RE.test(apiPath)) {
        data = stripSensitiveSolveFields(data);
        const root = data as Record<string, unknown>;
        const responseData = root?.data;
        const firstSolve =
          Array.isArray(responseData) && responseData.length > 0
            ? (responseData[0] as Record<string, unknown>)
            : null;
        logProxyDebug("response.sanitized.me-solves", {
          apiPath,
          count: Array.isArray(responseData) ? responseData.length : null,
          firstSolveKeys: firstSolve ? Object.keys(firstSolve) : [],
          challengeKeys:
            firstSolve &&
            firstSolve.challenge &&
            typeof firstSolve.challenge === "object"
              ? Object.keys(firstSolve.challenge as Record<string, unknown>)
              : [],
        });
      }

      return Response.json(data, {
        status: response.status,
        headers: {
          ...corsHeaders(origin),
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      });
    } catch (err) {
      logger.error("CTFd proxy error", err, { apiPath, targetUrl });
      return Response.json(
        { error: "Failed to reach CTFd API" },
        { status: 502, headers: corsHeaders(origin) },
      );
    }
  },
};

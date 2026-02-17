const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

// Allowed origins for CORS — production + Vercel preview deployments
const ALLOWED_ORIGINS = [
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

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }

    // Only allow GET — this proxy is read-only
    if (request.method !== "GET") {
      return Response.json(
        { error: "Method not allowed" },
        { status: 405, headers: corsHeaders(origin) },
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

const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

export default async function handler(request: Request): Promise<Response> {
  const token = process.env.CTFD_API_TOKEN;

  if (!token) {
    return new Response(JSON.stringify({ error: "CTFD_API_TOKEN is not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Extract path from URL: /api/v1/teams -> v1/teams
  const url = new URL(request.url);
  const pathParts = url.pathname.split("/").filter(Boolean);
  const apiPath = pathParts.slice(1).join("/"); // Remove "api" prefix
  const targetUrl = `${CTFD_BASE_URL}/api/${apiPath}${url.search}`;

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "s-maxage=10, stale-while-revalidate=20"
      }
    });
  } catch (err) {
    console.error("CTFd proxy error:", err);
    return new Response(JSON.stringify({ error: "Failed to reach CTFd API" }), {
      status: 502,
      headers: { "Content-Type": "application/json" }
    });
  }
}

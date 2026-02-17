const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

export default {
  async fetch(request: Request) {
    const token = process.env.CTFD_API_TOKEN;

    if (!token) {
      return Response.json({ error: "CTFD_API_TOKEN is not configured" }, { status: 500 });
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

      return Response.json(data, {
        status: response.status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Cache-Control": "s-maxage=30, stale-while-revalidate=60",
        },
      });
    } catch (err) {
      console.error("CTFd proxy error:", err);
      return Response.json({ error: "Failed to reach CTFd API" }, { status: 502 });
    }
  },
};

import type { VercelRequest, VercelResponse } from "@vercel/node";

const CTFD_BASE_URL = "https://issessionsctf.ctfd.io";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = process.env.CTFD_API_TOKEN;

  if (!token) {
    return res.status(500).json({ error: "CTFD_API_TOKEN is not configured" });
  }

  // Reconstruct the API path from the catch-all route
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join("/") : path;
  const targetUrl = `${CTFD_BASE_URL}/api/${apiPath}`;

  try {
    const response = await fetch(targetUrl, {
      method: req.method || "GET",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Forward CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");

    return res.status(response.status).json(data);
  } catch (err) {
    console.error("CTFd proxy error:", err);
    return res.status(502).json({ error: "Failed to reach CTFd API" });
  }
}

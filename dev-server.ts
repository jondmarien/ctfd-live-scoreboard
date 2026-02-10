/**
 * ISSessions Fantasy CTF - Local Development Server
 * Run with: bun dev-server.ts
 */

const CTFD_URL = "https://issessionsctf.ctfd.io";
const PORT = 8000;

// MIME types for static files
const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

const server = Bun.serve({
  port: PORT,

  async fetch(req) {
    const url = new URL(req.url);
    const pathname = url.pathname;

    // Proxy API requests to CTFd (bypasses CORS)
    if (pathname.startsWith("/api/")) {
      console.log(`🔮 Proxying: ${pathname}`);

      try {
        const ctfdUrl = `${CTFD_URL}${pathname}${url.search}`;
        const response = await fetch(ctfdUrl, {
          method: req.method,
          headers: {
            Authorization: req.headers.get("Authorization") || "",
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // Clone response with CORS headers for local dev
        const data = await response.text();
        return new Response(data, {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get("Content-Type") || "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } catch (error) {
        console.error("❌ Proxy error:", error);
        return new Response(JSON.stringify({ error: "Proxy failed" }), {
          status: 502,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    // Handle OPTIONS for CORS preflight
    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Authorization, Content-Type, Accept",
        },
      });
    }

    // Serve static files
    let filePath = pathname === "/" ? "/index.html" : pathname;
    const file = Bun.file(`.${filePath}`);

    if (await file.exists()) {
      const ext = filePath.substring(filePath.lastIndexOf("."));
      const contentType = MIME_TYPES[ext] || "application/octet-stream";

      console.log(`📜 Serving: ${filePath}`);
      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    }

    // Fallback to index.html for SPA routing
    console.log(`⚠️ Not found: ${pathname}, serving index.html`);
    return new Response(Bun.file("./index.html"), {
      headers: { "Content-Type": "text/html" },
    });
  },
});

console.log(`
⚔️ ═══════════════════════════════════════════════════════ ⚔️
   
   🐉 ISSessions Fantasy CTF - Guild Quest Board
   
   🏰 Local server:  http://localhost:${server.port}
   🔮 API proxy:     ${CTFD_URL}/api/*
   
   The Quest Giver awaits...
   
⚔️ ═══════════════════════════════════════════════════════ ⚔️
`);

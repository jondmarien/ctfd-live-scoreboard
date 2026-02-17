export default function handler(request: Request): Response {
  return new Response(JSON.stringify({ message: "API is working!", timestamp: Date.now() }), {
    headers: { "Content-Type": "application/json" }
  });
}

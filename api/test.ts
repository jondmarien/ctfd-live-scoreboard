export default {
  async fetch(request: Request) {
    return Response.json({ message: "API is working!", timestamp: Date.now() });
  },
};

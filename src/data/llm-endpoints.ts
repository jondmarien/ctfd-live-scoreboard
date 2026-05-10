/**
 * Maps challenge slug -> public /chat endpoint URL.
 * Keys must match the kebab-case slug used in routing (e.g. /challenges/the-enchanted-parrot).
 *
 * Long-term: replace with the connection_info field from CTFd's challenge detail response.
 * Doing this as a static map keeps the SPA decoupled from the connection_info string format
 * (which is human-readable, not machine-parseable).
 */
export const LLM_ENDPOINTS: Record<string, string> = {
  "the-enchanted-parrot": "https://parrot.ctf.chron0.tech/chat",
  "the-whispering-merchant": "https://whispering.ctf.chron0.tech/chat",
  "the-court-wizards-familiar": "https://court.ctf.chron0.tech/chat",
  "the-oracle-of-shadows": "https://oracle.ctf.chron0.tech/chat",
  "the-mindflayers-sanctum": "https://mindflayer.ctf.chron0.tech/chat",
};

export function getLLMEndpoint(slug: string): string | undefined {
  return LLM_ENDPOINTS[slug];
}

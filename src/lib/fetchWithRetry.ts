/**
 * Fetch wrapper with exponential backoff for CTFd 420 rate limits.
 * Retries up to `maxRetries` times with increasing delays.
 */
export async function fetchWithRetry(
  url: string,
  options?: RequestInit,
  maxRetries = 3,
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);

      // CTFd returns 420 for rate limits — back off and retry
      if (res.status === 420 && attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
        console.warn(
          `[fetchWithRetry] 420 on ${url}, retrying in ${Math.round(delay)}ms (attempt ${attempt + 1}/${maxRetries})`,
        );
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }

      return res;
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt) + Math.random() * 500;
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }

  throw lastError ?? new Error(`fetchWithRetry failed for ${url}`);
}

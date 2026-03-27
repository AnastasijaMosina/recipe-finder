const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

/** HTTP status codes worth retrying */
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

/**
 * Wraps fetch with an abort-based timeout.
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit & { next?: NextFetchRequestConfig } = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Retries a fetch request on transient/server errors with exponential back-off.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit & { next?: NextFetchRequestConfig } = {},
  maxRetries: number = DEFAULT_MAX_RETRIES,
  timeoutMs: number = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options, timeoutMs);

      // Don't retry on client-side errors (4xx), except retryable ones
      if (response.ok || (!RETRYABLE_STATUSES.has(response.status) && response.status < 500)) {
        return response;
      }

      // On the last attempt, return as-is for the caller to handle
      if (attempt === maxRetries) {
        return response;
      }

      // Exponential back-off: 500ms, 1000ms, 2000ms…
      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
    } catch (err) {
      lastError = err;

      if (attempt === maxRetries) {
        break;
      }

      await delay(RETRY_DELAY_MS * Math.pow(2, attempt));
    }
  }

  throw lastError;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Needed for Next.js fetch options type compatibility
type NextFetchRequestConfig = {
  revalidate?: number | false;
  tags?: string[];
};

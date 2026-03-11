interface RateLimitOptions {
  key: string;
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function getEnv(name: string): string {
  return (import.meta.env[name] || process.env[name] || '').trim();
}

function parsePositiveInt(raw: string, fallback: number): number {
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

export function getAdminRateLimitConfig(): { maxRequests: number; windowMs: number } {
  const maxRequests = parsePositiveInt(getEnv('ADMIN_RATE_LIMIT_MAX_REQUESTS'), 120);
  const windowSeconds = parsePositiveInt(getEnv('ADMIN_RATE_LIMIT_WINDOW_SECONDS'), 60);

  return {
    maxRequests,
    windowMs: windowSeconds * 1000,
  };
}

export function checkRateLimit({ key, maxRequests, windowMs }: RateLimitOptions): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const existing = rateLimitStore.get(key);

  if (!existing || existing.resetAt <= now) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return { allowed: true, retryAfterSeconds: Math.ceil(windowMs / 1000) };
  }

  existing.count += 1;
  rateLimitStore.set(key, existing);

  if (existing.count > maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  return {
    allowed: true,
    retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
  };
}

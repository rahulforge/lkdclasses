type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: limit - 1,
      resetAt: now + windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  return {
    allowed: true,
    remaining: Math.max(0, limit - current.count),
    resetAt: current.resetAt,
  };
}

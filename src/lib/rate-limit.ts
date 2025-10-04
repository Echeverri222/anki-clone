/**
 * Simple in-memory rate limiter
 * For production, consider using @upstash/ratelimit with Redis
 */

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateLimitRecord>();

// Clean up old entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  store.forEach((value, key) => {
    if (value.resetAt < now) {
      store.delete(key);
    }
  });
}, 10 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check if a request should be rate limited
 * 
 * @param identifier Unique identifier (e.g., userId or IP)
 * @param config Rate limit configuration
 * @returns Rate limit result
 */
export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 10, windowMs: 10000 }
): RateLimitResult {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || record.resetAt < now) {
    // Create new record
    store.set(identifier, {
      count: 1,
      resetAt: now + config.windowMs,
    });

    return {
      success: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - 1,
      reset: now + config.windowMs,
    };
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    return {
      success: false,
      limit: config.maxRequests,
      remaining: 0,
      reset: record.resetAt,
    };
  }

  // Increment count
  record.count++;
  store.set(identifier, record);

  return {
    success: true,
    limit: config.maxRequests,
    remaining: config.maxRequests - record.count,
    reset: record.resetAt,
  };
}

type Entry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, Entry>();

type RateLimitParams = {
  key: string;
  limit: number;
  windowMs: number;
};

export function rateLimit({ key, limit, windowMs }: RateLimitParams) {
  const now = Date.now();
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      retryAfterMs: windowMs,
    };
  }

  if (current.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: Math.max(0, current.resetAt - now),
    };
  }

  current.count += 1;
  store.set(key, current);

  return {
    success: true,
    remaining: Math.max(0, limit - current.count),
    retryAfterMs: Math.max(0, current.resetAt - now),
  };
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const [first] = forwarded.split(",");
    if (first?.trim()) return first.trim();
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

export type RateLimitConfig = {
  limit: number;
  windowMs: number;
  keyPrefix?: string;
  skipSuccessfulRequests?: boolean;
};

export function createRateLimitMiddleware(config: RateLimitConfig) {
  return async (request: Request): Promise<{ success: boolean; error?: string }> => {
    const ip = getClientIp(request);
    const key = `${config.keyPrefix || 'api'}:${ip}`;
    
    const result = rateLimit({
      key,
      limit: config.limit,
      windowMs: config.windowMs,
    });
    
    if (!result.success) {
      return {
        success: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil(result.retryAfterMs / 1000)} seconds.`,
      };
    }
    
    return { success: true };
  };
}


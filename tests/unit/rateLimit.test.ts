import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rateLimit";

describe("rateLimit", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows the first request and reports remaining budget", () => {
    const result = rateLimit({ key: "user-a", limit: 3, windowMs: 1000 });
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(2);
    expect(result.retryAfterMs).toBe(1000);
  });

  it("decrements remaining across subsequent requests within the window", () => {
    const key = "user-b";
    expect(rateLimit({ key, limit: 3, windowMs: 1000 }).remaining).toBe(2);
    expect(rateLimit({ key, limit: 3, windowMs: 1000 }).remaining).toBe(1);
    expect(rateLimit({ key, limit: 3, windowMs: 1000 }).remaining).toBe(0);
  });

  it("blocks requests once the limit is exceeded", () => {
    const key = "user-c";
    rateLimit({ key, limit: 2, windowMs: 1000 });
    rateLimit({ key, limit: 2, windowMs: 1000 });
    const blocked = rateLimit({ key, limit: 2, windowMs: 1000 });
    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterMs).toBeGreaterThan(0);
  });

  it("resets the window after it elapses", () => {
    const key = "user-d";
    rateLimit({ key, limit: 1, windowMs: 1000 });
    expect(rateLimit({ key, limit: 1, windowMs: 1000 }).success).toBe(false);

    vi.advanceTimersByTime(1001);

    const afterReset = rateLimit({ key, limit: 1, windowMs: 1000 });
    expect(afterReset.success).toBe(true);
    expect(afterReset.remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    rateLimit({ key: "key-1", limit: 1, windowMs: 1000 });
    const other = rateLimit({ key: "key-2", limit: 1, windowMs: 1000 });
    expect(other.success).toBe(true);
  });
});

describe("getClientIp", () => {
  const makeRequest = (headers: Record<string, string>) =>
    new Request("http://localhost", { headers });

  it("returns the first IP from x-forwarded-for", () => {
    const req = makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("trims whitespace from the forwarded IP", () => {
    const req = makeRequest({ "x-forwarded-for": "  9.9.9.9  " });
    expect(getClientIp(req)).toBe("9.9.9.9");
  });

  it("falls back to x-real-ip when no forwarded header", () => {
    const req = makeRequest({ "x-real-ip": "10.0.0.1" });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when no IP headers are present", () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe("unknown");
  });
});

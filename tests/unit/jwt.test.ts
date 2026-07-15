import { describe, it, expect, vi } from "vitest";

// The jwt module imports the Prisma client at load time; stub it so the unit
// tests stay isolated from the database.
vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { signAccessToken, verifyAccessToken } from "@/lib/jwt";

describe("signAccessToken / verifyAccessToken", () => {
  it("produces a token that can be verified back to its payload", async () => {
    const token = signAccessToken({ sub: "user-123", role: "MEMBER" }) as string;
    expect(typeof token).toBe("string");
    expect(token.split(".")).toHaveLength(3);

    const decoded = await verifyAccessToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded.sub).toBe("user-123");
    expect(decoded.role).toBe("MEMBER");
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it("returns null for a malformed token", async () => {
    expect(await verifyAccessToken("not-a-real-token")).toBeNull();
  });

  it("returns null for a token signed with a different secret", async () => {
    const { sign } = await import("jsonwebtoken");
    const foreign = sign({ sub: "x" }, "some-other-secret");
    expect(await verifyAccessToken(foreign)).toBeNull();
  });
});

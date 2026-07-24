import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signAccessToken, createRefreshToken } from "@/lib/jwt";
import { createRateLimitMiddleware, getClientIp } from "@/lib/rateLimit";
import { logAuthFailure, logRateLimitExceeded } from "@/lib/security-logger";

export const runtime = "nodejs";

const authRateLimit = createRateLimitMiddleware({
  limit: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
  keyPrefix: "auth",
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") || undefined;
  
  try {
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.success) {
      logRateLimitExceeded(undefined, ip, "/api/auth/token", "POST");
      return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
    }

    const { email, password, deviceInfo } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      logAuthFailure(undefined, ip, { email, reason: "User not found" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logAuthFailure(user.id, ip, { email, reason: "Invalid password" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Issue tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await createRefreshToken(user.id, deviceInfo);

    return NextResponse.json({ accessToken, refreshToken, expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
  } catch (err) {
    console.error("token endpoint error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

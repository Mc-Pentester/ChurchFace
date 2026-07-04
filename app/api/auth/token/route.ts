import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, createRefreshToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password, deviceInfo } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // naive auth for example — replace with real password check
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });

    // TODO: verify password — this is a placeholder
    // Issue tokens
    const accessToken = signAccessToken({ sub: user.id, email: user.email });
    const refreshToken = await createRefreshToken(user.id, deviceInfo);

    return NextResponse.json({ accessToken, refreshToken, expiresIn: process.env.JWT_EXPIRES_IN || "15m" });
  } catch (err) {
    console.error("token endpoint error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

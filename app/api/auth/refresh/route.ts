import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signAccessToken, createRefreshToken, revokeRefreshToken } from "@/lib/jwt";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { refreshToken, deviceInfo } = await req.json();
    if (!refreshToken) return NextResponse.json({ error: "Bad request" }, { status: 400 });

    const rt = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!rt || rt.revoked || rt.expiresAt < new Date()) {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    // issue new access and rotate refresh token
    const accessToken = signAccessToken({ sub: rt.userId });
    await revokeRefreshToken(refreshToken);
    const newRefresh = await createRefreshToken(rt.userId, deviceInfo);

    return NextResponse.json({ accessToken, refreshToken: newRefresh });
  } catch (err) {
    console.error("refresh endpoint error:", err);
    return NextResponse.json({ error: "Internal" }, { status: 500 });
  }
}

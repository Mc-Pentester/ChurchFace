import { sign, verify } from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET: string =
  process.env.JWT_SECRET ??
  (() => {
    throw new Error(
      "JWT_SECRET environment variable is not set. Refusing to start with an insecure default."
    );
  })();
const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);

export function signAccessToken(payload: object) {
  return sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRES_IN });
}

export async function verifyAccessToken(token: string) {
  try {
    return verify(token, JWT_SECRET) as any;
  } catch (err) {
    return null;
  }
}

export async function createRefreshToken(userId: string, deviceInfo?: string) {
  // For simplicity we store a random token (in production hash it)
  const token = `${userId}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  const rt = await prisma.refreshToken.create({ data: { userId, token, deviceInfo: deviceInfo || null, expiresAt } });
  return rt.token;
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({ where: { token }, data: { revoked: true } });
}

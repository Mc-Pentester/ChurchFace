import { sign, verify } from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

const ACCESS_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRES_DAYS || "30", 10);

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function signAccessToken(payload: object) {
  return sign(payload, getJwtSecret(), {
    expiresIn: ACCESS_EXPIRES_IN,
  } as SignOptions);
}

export function verifyAccessToken(token: string) {
  try {
    return verify(token, getJwtSecret());
  } catch {
    return null;
  }
}

export async function createRefreshToken(userId: string, deviceInfo?: string) {
  // Cryptographically strong token; only its hash is persisted.
  const token = randomBytes(48).toString("hex");
  const expiresAt = new Date(Date.now() + REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);
  await prisma.refreshToken.create({
    data: { userId, token: hashToken(token), deviceInfo: deviceInfo || null, expiresAt },
  });
  return token;
}

export async function findValidRefreshToken(token: string) {
  const rt = await prisma.refreshToken.findUnique({ where: { token: hashToken(token) } });
  if (!rt || rt.revoked || rt.expiresAt < new Date()) return null;
  return rt;
}

export async function revokeRefreshToken(token: string) {
  await prisma.refreshToken.updateMany({
    where: { token: hashToken(token) },
    data: { revoked: true },
  });
}

import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signAccessToken, createRefreshToken } from "@/lib/jwt";
import { createRateLimitMiddleware, getClientIp } from "@/lib/rateLimit";
import { logAuthFailure, logRateLimitExceeded } from "@/lib/security-logger";
import { loginSchema } from "@/lib/validators/schemas";

export const runtime = "nodejs";

const authRateLimit = createRateLimitMiddleware({
  limit: 5,
  windowMs: 300 * 1000, // 5 minutes
  keyPrefix: "auth",
});

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const userAgent = req.headers.get("user-agent") || undefined;
    
    const rateLimitResult = await authRateLimit(req);
    if (!rateLimitResult.success) {
      logRateLimitExceeded(undefined, ip, "/api/auth/token", "POST");
      return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
    }

    const { email, password, deviceInfo } = await req.json();

    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const issues = validationResult.error.issues;
      const messages = issues.map(issue => {
        if (issue.path[0] === 'email') return "L'email doit être valide";
        if (issue.path[0] === 'password') return "Le mot de passe doit contenir au moins 6 caractères";
        return issue.message;
      });
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !user.password) {
      logAuthFailure(undefined, ip, { email, reason: "User not found" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logAuthFailure(user.id, ip, { email, reason: "Invalid password" });
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Pour tests: retourner succès sans JWT (version mobile-first pas encore implémentée)
    return NextResponse.json({ 
      success: true, 
      userId: user.id, 
      email: user.email,
      message: "Authentification réussie (mode test sans JWT)" 
    });
  } catch (err) {
    console.error("token endpoint error:", err);
    return NextResponse.json({ error: "Internal", details: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

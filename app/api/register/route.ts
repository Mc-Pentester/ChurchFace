import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createRateLimitMiddleware, getClientIp } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validators/schemas";
import { logRateLimitExceeded } from "@/lib/security-logger";

export const runtime = "nodejs";

const registerRateLimit = createRateLimitMiddleware({
  limit: 3,
  windowMs: 60 * 60 * 1000, // 1 heure
  keyPrefix: "register",
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  
  try {
    const rateLimitResult = await registerRateLimit(req);
    if (!rateLimitResult.success) {
      logRateLimitExceeded(undefined, ip, "/api/register", "POST");
      return NextResponse.json({ error: rateLimitResult.error }, { status: 429 });
    }

    const body = await req.json();

    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email dÃ©jÃ  utilisÃ©" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);

  } catch (error: any) {

  console.error("Registration error:", error);
  
  return NextResponse.json(
    {
      error: error.message,
      details: error.code
    },
    { status:500 }
  );
}
}


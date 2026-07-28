import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { createRateLimitMiddleware, getClientIp } from "@/lib/rateLimit";
import { registerSchema } from "@/lib/validators/schemas";
import { logRateLimitExceeded } from "@/lib/security-logger";

export const runtime = "nodejs";

const registerRateLimit = createRateLimitMiddleware({
  limit: 3,
  windowMs: 300 * 1000, // 5 minutes
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
      const issues = validationResult.error.issues;
      const messages = issues.map(issue => {
        if (issue.path[0] === 'email') return "L'email doit être valide";
        if (issue.path[0] === 'password') return "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre";
        if (issue.path[0] === 'name') return "Le nom doit contenir au moins 2 caractères et uniquement des lettres, espaces, tirets et apostrophes";
        return issue.message;
      });
      return NextResponse.json(
        { error: messages.join('. ') },
        { status: 400 }
      );
    }

    const { name, email, password } = validationResult.data;

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Impossible de créer le compte avec ces informations" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
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


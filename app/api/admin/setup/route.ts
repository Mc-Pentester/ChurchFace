import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 🔓 ONE-TIME SETUP: Promouvoir l'utilisateur courant en ADMIN
 * À supprimer en production après utilisation.
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json(
      { error: "Vous devez être connecté pour utiliser ce endpoint." },
      { status: 401 }
    );
  }

  const user = await prisma.user.update({
    where: { email: session.user.email },
    data: { role: "ADMIN" },
  });

  return NextResponse.json({
    success: true,
    message: `${user.email} est maintenant ADMIN. Rafraîchissez la page.`,
    user: { id: user.id, email: user.email, role: user.role },
  });
}

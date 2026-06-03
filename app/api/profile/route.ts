import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/profile
 * Get current user profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement profil" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 * Update current user profile
 */
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : undefined;
    const bio = typeof body?.bio === "string" ? body.bio.trim() : undefined;
    const image = typeof body?.image === "string" ? body.image.trim() : undefined;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (bio !== undefined) data.bio = bio;
    if (image !== undefined) data.image = image;

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Aucune donnée à mettre à jour" },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Erreur mise à jour profil" },
      { status: 500 }
    );
  }
}

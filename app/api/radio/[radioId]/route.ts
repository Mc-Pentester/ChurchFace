import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/radio/:id — Détails d'une radio
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const { radioId } = await params;

    const radio = await prisma.radio.findUnique({
      where: { id: radioId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!radio) {
      return NextResponse.json(
        { error: "Radio introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("GET RADIO ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement radio" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/radio/:id — Terminer une radio
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId } = await params;

    const updated = await prisma.radio.updateMany({
      where: { id: radioId, userId },
      data: { isLive: false, endedAt: new Date() },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Radio introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("END RADIO ERROR:", error);
    return NextResponse.json(
      { error: "Erreur fin de la radio" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/streams/:id — Détails d'un stream
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const { streamId } = await params;

    const stream = await prisma.stream.findUnique({
      where: { id: streamId },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    if (!stream) {
      return NextResponse.json(
        { error: "Stream introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ stream });
  } catch (error) {
    console.error("GET STREAM ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement stream" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/streams/:id — Terminer un stream
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ streamId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { streamId } = await params;

    const stream = await prisma.stream.updateMany({
      where: { id: streamId, userId },
      data: { isLive: false, endedAt: new Date() },
    });

    if (stream.count === 0) {
      return NextResponse.json(
        { error: "Stream introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("END STREAM ERROR:", error);
    return NextResponse.json(
      { error: "Erreur fin du stream" },
      { status: 500 }
    );
  }
}

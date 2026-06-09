import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

const radioInclude = {
  user: { select: { id: true, name: true, image: true } },
  playlist: { include: { items: { orderBy: { order: "asc" as const } } } },
};

/**
 * GET — Radio du studio pour l'utilisateur connecté (crée si absente).
 */
export async function GET() {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    let radio = await prisma.radio.findFirst({
      where: { userId: host.id },
      orderBy: { startedAt: "desc" },
      include: radioInclude,
    });

    if (!radio) {
      const playlist = await prisma.playlist.create({
        data: {
          title: `${host.name || "Studio"} — Playlist`,
          description: "Playlist par défaut du studio",
        },
      });

      radio = await prisma.radio.create({
        data: {
          title: `${host.name || "ChurchFace"} Radio`,
          description: "Émission radio de l'église",
          userId: host.id,
          isLive: false,
          playlistId: playlist.id,
        },
        include: radioInclude,
      });
    }

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("STUDIO RADIO GET ERROR:", error);
    return NextResponse.json({ error: "Erreur chargement studio" }, { status: 500 });
  }
}

/**
 * PATCH — Mettre à jour titre, playlist assignée, etc.
 */
export async function PATCH(req: NextRequest) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const radioId = body?.id;
    if (!radioId) {
      return NextResponse.json({ error: "Radio ID requis" }, { status: 400 });
    }

    const existing = await prisma.radio.findFirst({
      where: { id: radioId, userId: host.id },
    });
    if (!existing && host.role !== "ADMIN" && host.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const radio = await prisma.radio.update({
      where: { id: radioId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.playlistId !== undefined && { playlistId: body.playlistId }),
      },
      include: radioInclude,
    });

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("STUDIO RADIO PATCH ERROR:", error);
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

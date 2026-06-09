import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * POST — Ajouter une piste à une playlist (sans réécrire toute la liste).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ playlistId: string }> }
) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { playlistId } = await params;
    const body = await req.json();

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!title || !url) {
      return NextResponse.json({ error: "Titre et URL requis" }, { status: 400 });
    }

    const playlist = await prisma.playlist.findUnique({
      where: { id: playlistId },
      select: { id: true },
    });

    if (!playlist) {
      return NextResponse.json({ error: "Playlist introuvable" }, { status: 404 });
    }

    const order = await prisma.playlistItem.count({ where: { playlistId } });

    await prisma.playlistItem.create({
      data: {
        playlistId,
        title,
        url,
        type: body?.type === "VIDEO" ? "VIDEO" : "AUDIO",
        duration: typeof body?.duration === "number" ? body.duration : null,
        order,
      },
    });

    const updated = await prisma.playlist.findUnique({
      where: { id: playlistId },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ playlist: updated });
  } catch (error) {
    console.error("PLAYLIST ITEM POST ERROR:", error);
    return NextResponse.json({ error: "Erreur ajout piste" }, { status: 500 });
  }
}

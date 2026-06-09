import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET — Playlists disponibles pour le studio.
 */
export async function GET() {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const playlists = await prisma.playlist.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        items: { orderBy: { order: "asc" } },
        _count: { select: { items: true } },
      },
    });

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error("STUDIO PLAYLISTS GET ERROR:", error);
    return NextResponse.json({ error: "Erreur chargement playlists" }, { status: 500 });
  }
}

/**
 * POST — Créer une playlist.
 */
export async function POST(req: Request) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ error: "Titre requis" }, { status: 400 });
    }

    const playlist = await prisma.playlist.create({
      data: {
        title,
        description: body?.description || null,
        category: body?.category || "GENERAL",
        items: body?.items?.length
          ? {
              create: body.items.map((it: { title?: string; url: string; type?: string; duration?: number }, idx: number) => ({
                title: it.title || `Piste ${idx + 1}`,
                url: it.url,
                type: it.type || "AUDIO",
                duration: it.duration ?? null,
                order: idx,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("STUDIO PLAYLIST CREATE ERROR:", error);
    return NextResponse.json({ error: "Erreur création playlist" }, { status: 500 });
  }
}

/**
 * PATCH — Mettre à jour une playlist (titre, items, ordre).
 */
export async function PATCH(req: Request) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, description, items } = body;

    if (!id) {
      return NextResponse.json({ error: "Playlist ID requis" }, { status: 400 });
    }

    if (items) {
      await prisma.playlistItem.deleteMany({ where: { playlistId: id } });
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        items: items?.length
          ? {
              create: items.map((it: { title?: string; url: string; type?: string; duration?: number }, idx: number) => ({
                title: it.title || `Piste ${idx + 1}`,
                url: it.url,
                type: it.type || "AUDIO",
                duration: it.duration ?? null,
                order: idx,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("STUDIO PLAYLIST PATCH ERROR:", error);
    return NextResponse.json({ error: "Erreur mise à jour playlist" }, { status: 500 });
  }
}

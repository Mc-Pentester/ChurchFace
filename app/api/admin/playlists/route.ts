import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 📥 GET ALL PLAYLISTS
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
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
    console.error("ADMIN PLAYLISTS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load playlists" }, { status: 500 });
  }
}

/**
 * ➕ CREATE PLAYLIST
 */
export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, items } = body;

    if (!title) {
      return NextResponse.json({ error: "Title required" }, { status: 400 });
    }

    const playlist = await prisma.playlist.create({
      data: {
        title,
        description: description || null,
        items: items?.length
          ? {
              create: items.map((it: any, idx: number) => ({
                title: it.title || `Piste ${idx + 1}`,
                url: it.url,
                type: it.type || "AUDIO",
                duration: it.duration || null,
                order: idx,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("ADMIN PLAYLIST CREATE ERROR:", error);
    return NextResponse.json({ error: "Failed to create playlist" }, { status: 500 });
  }
}

/**
 * ✏️ UPDATE PLAYLIST (title, description, items)
 */
export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, description, items } = body;

    if (!id) {
      return NextResponse.json({ error: "Playlist ID required" }, { status: 400 });
    }

    // Delete old items and recreate if new items provided
    if (items) {
      await prisma.playlistItem.deleteMany({ where: { playlistId: id } });
    }

    const playlist = await prisma.playlist.update({
      where: { id },
      data: {
        title: title || undefined,
        description: description !== undefined ? description : undefined,
        items: items?.length
          ? {
              create: items.map((it: any, idx: number) => ({
                title: it.title || `Piste ${idx + 1}`,
                url: it.url,
                type: it.type || "AUDIO",
                duration: it.duration || null,
                order: idx,
              })),
            }
          : undefined,
      },
      include: { items: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({ playlist });
  } catch (error) {
    console.error("ADMIN PLAYLIST UPDATE ERROR:", error);
    return NextResponse.json({ error: "Failed to update playlist" }, { status: 500 });
  }
}

/**
 * ❌ DELETE PLAYLIST
 */
export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Playlist ID required" }, { status: 400 });
    }

    await prisma.playlist.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN PLAYLIST DELETE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete playlist" }, { status: 500 });
  }
}

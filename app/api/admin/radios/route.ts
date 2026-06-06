import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * 📥 GET RADIOS
 */
export async function GET() {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const radios = await prisma.radio.findMany({
      orderBy: { startedAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        playlist: { include: { items: { orderBy: { order: "asc" } } } },
      },
    });

    return NextResponse.json({ radios });
  } catch (error) {
    console.error("ADMIN RADIOS GET ERROR:", error);
    return NextResponse.json({ error: "Failed to load radios" }, { status: 500 });
  }
}

/**
 * ✏️ UPDATE RADIO (assign playlist)
 */
export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { id, playlistId } = body;

    if (!id) {
      return NextResponse.json({ error: "Radio ID required" }, { status: 400 });
    }

    const radio = await prisma.radio.update({
      where: { id },
      data: { playlistId: playlistId || null },
      include: {
        user: { select: { id: true, name: true, email: true } },
        playlist: { include: { items: { orderBy: { order: "asc" } } } },
      },
    });

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("ADMIN RADIO PATCH ERROR:", error);
    return NextResponse.json({ error: "Failed to update radio" }, { status: 500 });
  }
}

/**
 * ❌ DELETE RADIO
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
      return NextResponse.json({ error: "Radio ID required" }, { status: 400 });
    }

    await prisma.radio.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN RADIO DELETE ERROR:", error);
    return NextResponse.json({ error: "Failed to delete radio" }, { status: 500 });
  }
}

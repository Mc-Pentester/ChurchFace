import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    // Get church radios
    const churchRadios = await prisma.churchRadio.findMany({
      where: { churchId, isActive: true },
      include: {
        radio: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            playlist: {
              include: {
                items: { orderBy: { order: "asc" } },
              },
            },
          },
        },
        playlist: {
          include: {
            items: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    // Get global live radios
    const globalRadios = await prisma.radio.findMany({
      where: { isLive: true },
      orderBy: { startedAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        playlist: {
          include: {
            items: { orderBy: { order: "asc" } },
          },
        },
      },
    });

    // Get church playlists
    const playlists = await prisma.playlist.findMany({
      where: { churchId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    // Combine church radios (with their Radio if exists) and global radios
    const allRadios = [
      ...churchRadios
        .filter((cr) => cr.radio)
        .map((cr) => ({
          ...cr.radio,
          churchRadioId: cr.id,
          churchStreamUrl: cr.streamUrl,
          isChurchRadio: true,
        })),
      ...globalRadios.map((r) => ({
        ...r,
        isChurchRadio: false,
      })),
    ];

    return NextResponse.json({
      radios: allRadios,
      playlists,
    });
  } catch (error) {
    console.error("Error fetching radio data:", error);
    return NextResponse.json({ error: "Failed to fetch radio data" }, { status: 500 });
  }
}

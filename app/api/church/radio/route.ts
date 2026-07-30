import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const churchRadio = await prisma.churchRadio.findFirst({
      where: { churchId },
      include: {
        radio: {
          include: {
            playlist: {
              include: {
                items: true,
              },
            },
          },
        },
      },
    });

    const isLive = churchRadio?.radio?.isLive || false;
    const currentTrack = churchRadio?.radio?.currentTrack || null;

    const playlists = await prisma.playlist.findMany({
      where: { churchId },
      include: {
        _count: {
          select: { items: true },
        },
      },
    });

    return NextResponse.json({
      isLive,
      currentTrack,
      playlists,
    });
  } catch (error) {
    console.error("Error fetching radio data:", error);
    return NextResponse.json({ error: "Failed to fetch radio data" }, { status: 500 });
  }
}

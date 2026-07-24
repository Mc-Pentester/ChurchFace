import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET - Récupérer les tracks pour une église
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const church = await prisma.church.findUnique({
      where: {
        slug,
      },
      include: {
        admins: true,
      },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const isAdmin = church.admins.some(
      (admin) => admin.userId === session.user.id
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    /**
     * Tracks appartenant aux playlists de cette église
     */
    const tracks = await prisma.playlistItem.findMany({
      where: {
        playlist: {
          churchId: church.id,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        playlist: true,
      },
    });

    return NextResponse.json({
      tracks,
    });
  } catch (error) {
    console.error(
      "Error fetching church studio tracks:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch tracks" },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer un track pour une playlist d'église
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const church = await prisma.church.findUnique({
      where: {
        slug,
      },
      include: {
        admins: true,
      },
    });

    if (!church) {
      return NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      );
    }

    const isAdmin = church.admins.some(
      (admin) => admin.userId === session.user.id
    );

    if (!isAdmin) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const playlistId =
      typeof body?.playlistId === "string"
        ? body.playlistId
        : "";

    const title =
      typeof body?.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "Sans titre";

    const url =
      typeof body?.url === "string"
        ? body.url.trim()
        : "";

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    if (!url) {
      return NextResponse.json(
        { error: "Track URL is required" },
        { status: 400 }
      );
    }

    /**
     * Vérifier que la playlist appartient bien à cette église
     */
    const playlist = await prisma.playlist.findFirst({
      where: {
        id: playlistId,
        churchId: church.id,
      },
    });

    if (!playlist) {
      return NextResponse.json(
        {
          error:
            "Playlist inexistante pour cette église",
        },
        { status: 404 }
      );
    }

    const track = await prisma.playlistItem.create({
      data: {
        title,
        url,
        duration:
          typeof body?.duration === "number"
            ? body.duration
            : null,
        type:
          typeof body?.type === "string" &&
          body.type.trim()
            ? body.type.trim()
            : "AUDIO",
        playlistId: playlist.id,
      },
    });

    return NextResponse.json(
      {
        track,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Error creating church studio track:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create track",
      },
      { status: 500 }
    );
  }
}
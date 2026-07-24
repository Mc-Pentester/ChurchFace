import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * Vérifie que l'utilisateur connecté est administrateur de l'église.
 */
async function getAuthorizedChurch(
  slug: string,
  userId: string
) {
  const church = await prisma.church.findUnique({
    where: { slug },
    include: {
      admins: true,
    },
  });

  if (!church) {
    return {
      church: null,
      error: NextResponse.json(
        { error: "Church not found" },
        { status: 404 }
      ),
    };
  }

  const isAdmin = church.admins.some(
    (admin) => admin.userId === userId
  );

  if (!isAdmin) {
    return {
      church: null,
      error: NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      ),
    };
  }

  return {
    church,
    error: null,
  };
}

/**
 * GET - Récupérer les playlists d'une église
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
    const { church, error } = await getAuthorizedChurch(
      slug,
      session.user.id
    );

    if (error || !church) {
      return error;
    }

    const playlists = await prisma.playlist.findMany({
      where: {
        churchId: church.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({ playlists });
  } catch (error) {
    console.error(
      "Error fetching church playlists:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch playlists" },
      { status: 500 }
    );
  }
}

/**
 * POST - Créer une playlist pour une église
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

    const { church, error } = await getAuthorizedChurch(
      slug,
      session.user.id
    );

    if (error || !church) {
      return error;
    }

    const playlist = await prisma.playlist.create({
      data: {
        churchId: church.id,
        title:
          typeof body.title === "string" &&
          body.title.trim()
            ? body.title.trim()
            : "Nouvelle playlist",
        description:
          typeof body.description === "string"
            ? body.description.trim() || null
            : null,
        category:
          typeof body.category === "string" &&
          body.category.trim()
            ? body.category.trim()
            : "GENERAL",
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(
      { playlist },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE CHURCH PLAYLIST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed creating playlist" },
      { status: 500 }
    );
  }
}

/**
 * PATCH - Modifier une playlist
 */
export async function PATCH(
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

    if (!body.id) {
      return NextResponse.json(
        { error: "Playlist ID is required" },
        { status: 400 }
      );
    }

    const { church, error } = await getAuthorizedChurch(
      slug,
      session.user.id
    );

    if (error || !church) {
      return error;
    }

    const existingPlaylist =
      await prisma.playlist.findFirst({
        where: {
          id: body.id,
          churchId: church.id,
        },
      });

    if (!existingPlaylist) {
      return NextResponse.json(
        { error: "Playlist not found" },
        { status: 404 }
      );
    }

    const playlist = await prisma.playlist.update({
      where: {
        id: existingPlaylist.id,
      },
      data: {
        ...(body.title !== undefined && {
          title: body.title,
        }),

        ...(body.description !== undefined && {
          description: body.description,
        }),

        ...(body.category !== undefined && {
          category: body.category,
        }),
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      playlist,
    });
  } catch (error) {
    console.error(
      "UPDATE CHURCH PLAYLIST ERROR:",
      error
    );

    return NextResponse.json(
      { error: "Failed updating playlist" },
      { status: 500 }
    );
  }
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions, canManageRadio } from "@/lib/auth";
import { getSocketServer } from "@/lib/io";

export const runtime = "nodejs";

/**
 * GET /api/radio/:id — Détails d'une radio
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const { radioId } = await params;

    const radio = await prisma.radio.findUnique({
      where: { id: radioId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        playlist: {
          include: {
            items: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (!radio) {
      return NextResponse.json(
        { error: "Radio introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("GET RADIO ERROR:", error);

    return NextResponse.json(
      { error: "Erreur chargement radio" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/radio/:id — Terminer une radio
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { radioId } = await params;

    const updated = await prisma.radio.updateMany({
      where: {
        id: radioId,
        userId,
      },
      data: {
        isLive: false,
        endedAt: new Date(),
      },
    });

    if (updated.count === 0) {
      return NextResponse.json(
        { error: "Radio introuvable ou non autorisé" },
        { status: 404 }
      );
    }

    const io = getSocketServer();

    io?.to(`radio:${radioId}`).emit("radio:status", {
      isLive: false,
    });

    io?.to(`studio:${radioId}`).emit("radio:status", {
      isLive: false,
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("END RADIO ERROR:", error);

    return NextResponse.json(
      { error: "Erreur fin de la radio" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/radio/:id — Mettre à jour une radio (studio)
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const { radioId } = await params;

    const allowed = await canManageRadio(radioId, userId);

    if (!allowed) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const data: Record<string, unknown> = {};

    if (body.title !== undefined) {
      data.title = body.title;
    }

    if (body.description !== undefined) {
      data.description = body.description;
    }

    if (body.isLive !== undefined) {
      data.isLive = body.isLive;
    }

    if (body.isAutoDJ !== undefined) {
      data.isAutoDJ = body.isAutoDJ;
    }

    if (body.streamUrl !== undefined) {
      data.streamUrl = body.streamUrl;
    }

    /**
     * Le modèle Prisma Radio possède `currentTrack`
     * et non `currentTrackId`.
     */
    if (body.currentTrack !== undefined) {
      data.currentTrack = body.currentTrack;
    }

    /**
     * La playlist est une relation Prisma.
     */
    if (body.playlistId !== undefined) {
      data.playlist =
        body.playlistId === null
          ? { disconnect: true }
          : { connect: { id: body.playlistId } };
    }

    if (body.isLive === true && !body.startedAt) {
      data.startedAt = new Date();
      data.endedAt = null;
    }

    if (body.isLive === false) {
      data.endedAt = body.endedAt
        ? new Date(body.endedAt)
        : new Date();
    }

    if (body.startedAt !== undefined) {
      data.startedAt = body.startedAt
        ? new Date(body.startedAt)
        : null;
    }

    if (body.endedAt !== undefined) {
      data.endedAt = body.endedAt
        ? new Date(body.endedAt)
        : null;
    }

    const updated = await prisma.radio.update({
      where: {
        id: radioId,
      },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        playlist: {
          include: {
            items: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
    });

    if (body.isLive !== undefined) {
      const io = getSocketServer();

      io?.to(`radio:${radioId}`).emit("radio:status", {
        isLive: updated.isLive,
      });

      io?.to(`studio:${radioId}`).emit("radio:status", {
        isLive: updated.isLive,
      });
    }

    return NextResponse.json({
      radio: updated,
    });
  } catch (error) {
    console.error("UPDATE RADIO ERROR:", error);

    return NextResponse.json(
      { error: "Erreur mise à jour radio" },
      { status: 500 }
    );
  }
}
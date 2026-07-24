import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET — Lister toutes les playlists globales du Studio.
 */
export async function GET() {
  try {
    const host = await requireStudioAccess();

    if (!host) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const playlists = await prisma.playlist.findMany({
      where: {
        churchId: null,
      },
      include: {
        items: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return NextResponse.json({
      playlists,
    });
  } catch (error) {
    console.error(
      "STUDIO PLAYLISTS GET ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur lors de la récupération des playlists",
      },
      { status: 500 }
    );
  }
}

/**
 * POST — Créer une nouvelle playlist globale.
 */
export async function POST(req: Request) {
  try {
    const host = await requireStudioAccess();

    if (!host) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await req.json();

    const title =
      typeof body?.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "Nouvelle playlist";

    const description =
      typeof body?.description === "string"
        ? body.description.trim() || null
        : null;

    const category =
      typeof body?.category === "string" &&
      body.category.trim()
        ? body.category.trim()
        : "GENERAL";

    const playlist = await prisma.playlist.create({
      data: {
        title,
        description,
        category,
        churchId: null,
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
      {
        playlist,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "STUDIO PLAYLIST POST ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur lors de la création de la playlist",
      },
      { status: 500 }
    );
  }
}
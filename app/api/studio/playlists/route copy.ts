import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{
    playlistId: string;
  }>;
}

/**
 * POST — Ajouter une piste à une playlist.
 */
export async function POST(
  req: Request,
  context: RouteContext,
) {
  try {
    const host = await requireStudioAccess();

    if (!host) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 },
      );
    }

    const { playlistId } = await context.params;

    if (!playlistId) {
      return NextResponse.json(
        { error: "Playlist ID requis" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const title =
      typeof body?.title === "string" &&
      body.title.trim()
        ? body.title.trim()
        : "Sans titre";

    const url =
      typeof body?.url === "string"
        ? body.url.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        { error: "URL de la piste requise" },
        { status: 400 },
      );
    }

    const playlist =
      await prisma.churchPlaylist.findFirst({
        where: {
          id: playlistId,
          churchId: host.churchId,
        },
        include: {
          items: {
            orderBy: {
              order: "asc",
            },
          },
        },
      });

    if (!playlist) {
      return NextResponse.json(
        { error: "Playlist introuvable" },
        { status: 404 },
      );
    }

    const lastItem =
      playlist.items[
        playlist.items.length - 1
      ];

    const nextOrder =
      lastItem
        ? lastItem.order + 1
        : 0;

    await prisma.churchPlaylistItem.create({
      data: {
        playlistId,
        title,
        url,
        type:
          body?.type === "VIDEO"
            ? "VIDEO"
            : "AUDIO",
        duration:
          typeof body?.duration === "number"
            ? body.duration
            : null,
        order: nextOrder,
      },
    });

    const updatedPlaylist =
      await prisma.churchPlaylist.findUnique({
        where: {
          id: playlistId,
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
      playlist: updatedPlaylist,
    });
  } catch (error) {
    console.error(
      "STUDIO PLAYLIST ITEM POST ERROR:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Erreur lors de l'ajout de la piste",
      },
      { status: 500 },
    );
  }
}
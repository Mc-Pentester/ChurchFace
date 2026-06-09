import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudioAccess } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET — Bibliothèque audio (AudioTrack).
 */
export async function GET(req: NextRequest) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const category = req.nextUrl.searchParams.get("category");
    const search = req.nextUrl.searchParams.get("q")?.trim();

    const tracks = await prisma.audioTrack.findMany({
      where: {
        isActive: true,
        ...(category && category !== "ALL" ? { category } : {}),
        ...(search
          ? {
              OR: [
                { title: { contains: search, mode: "insensitive" } },
                { artist: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error("STUDIO TRACKS GET ERROR:", error);
    return NextResponse.json({ error: "Erreur chargement bibliothèque" }, { status: 500 });
  }
}

/**
 * POST — Ajouter une piste à la bibliothèque.
 */
export async function POST(req: NextRequest) {
  try {
    const host = await requireStudioAccess();
    if (!host) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const url = typeof body?.url === "string" ? body.url.trim() : "";

    if (!title || !url) {
      return NextResponse.json({ error: "Titre et URL requis" }, { status: 400 });
    }

    const track = await prisma.audioTrack.create({
      data: {
        title,
        url,
        artist: body?.artist || null,
        album: body?.album || null,
        coverUrl: body?.coverUrl || null,
        duration: body?.duration ?? 0,
        type: body?.type || "MUSIC",
        category: body?.category || "GENERAL",
        uploadedBy: host.id,
      },
    });

    return NextResponse.json({ track });
  } catch (error) {
    console.error("STUDIO TRACK CREATE ERROR:", error);
    return NextResponse.json({ error: "Erreur ajout piste" }, { status: 500 });
  }
}

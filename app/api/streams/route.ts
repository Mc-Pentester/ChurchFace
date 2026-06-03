import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/streams — Liste les streams actifs
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get("all") === "true";

    const streams = await prisma.stream.findMany({
      where: all ? undefined : { isLive: true },
      orderBy: { startedAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ streams });
  } catch (error) {
    console.error("GET STREAMS ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement streams" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/streams — Créer un stream
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Non autorisé" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Titre requis" },
        { status: 400 }
      );
    }

    const stream = await prisma.stream.create({
      data: {
        title,
        description: description || null,
        userId,
        isLive: true,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ stream });
  } catch (error) {
    console.error("CREATE STREAM ERROR:", error);
    return NextResponse.json(
      { error: "Erreur création stream" },
      { status: 500 }
    );
  }
}

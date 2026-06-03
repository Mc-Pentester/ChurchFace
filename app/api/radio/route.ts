import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/radio — Liste les radios actives
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const all = searchParams.get("all") === "true";

    const radios = await prisma.radio.findMany({
      where: all ? undefined : { isLive: true },
      orderBy: { startedAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    });

    return NextResponse.json({ radios });
  } catch (error) {
    console.error("GET RADIO ERROR:", error);
    return NextResponse.json(
      { error: "Erreur chargement radios" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/radio — Créer une radio
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
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

    const radio = await prisma.radio.create({
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

    return NextResponse.json({ radio });
  } catch (error) {
    console.error("CREATE RADIO ERROR:", error);
    return NextResponse.json(
      { error: "Erreur création radio" },
      { status: 500 }
    );
  }
}

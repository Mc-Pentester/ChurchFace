import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * GET /api/radio/:id/schedules — Plannings d'une radio
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const { radioId } = await params;
    const schedules = await prisma.radioSchedule.findMany({
      where: { radioId },
      orderBy: { startTime: "asc" },
      include: {
        playlist: { select: { id: true, title: true } },
      },
    });
    return NextResponse.json({ schedules });
  } catch (error) {
    console.error("RADIO SCHEDULES GET ERROR:", error);
    return NextResponse.json({ error: "Erreur chargement plannings" }, { status: 500 });
  }
}

/**
 * POST /api/radio/:id/schedules — Créer un planning
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId } = await params;
    const body = await req.json();
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const startTime = body?.startTime ? new Date(body.startTime) : null;

    if (!title || !startTime) {
      return NextResponse.json({ error: "Titre et date requis" }, { status: 400 });
    }

    const schedule = await prisma.radioSchedule.create({
      data: {
        radioId,
        title,
        description: body?.description || null,
        hostName: body?.hostName || null,
        startTime,
        duration: body?.duration || 60,
        isRecurring: body?.isRecurring || false,
        recurrence: body?.recurrence || null,
        playlistId: body?.playlistId || null,
      },
      include: {
        playlist: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("RADIO SCHEDULES POST ERROR:", error);
    return NextResponse.json({ error: "Erreur création planning" }, { status: 500 });
  }
}

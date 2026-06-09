import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * PATCH /api/radio/:id/schedules/:scheduleId — Modifier un planning
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string; scheduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId, scheduleId } = await params;
    const body = await req.json();

    const schedule = await prisma.radioSchedule.update({
      where: { id: scheduleId, radioId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.hostName !== undefined && { hostName: body.hostName }),
        ...(body.startTime !== undefined && { startTime: new Date(body.startTime) }),
        ...(body.duration !== undefined && { duration: body.duration }),
        ...(body.playlistId !== undefined && { playlistId: body.playlistId }),
        ...(body.isRecurring !== undefined && { isRecurring: body.isRecurring }),
        ...(body.recurrence !== undefined && { recurrence: body.recurrence }),
      },
      include: { playlist: { select: { id: true, title: true } } },
    });

    return NextResponse.json({ schedule });
  } catch (error) {
    console.error("RADIO SCHEDULE PATCH ERROR:", error);
    return NextResponse.json({ error: "Erreur mise à jour" }, { status: 500 });
  }
}

/**
 * DELETE /api/radio/:id/schedules/:scheduleId — Supprimer un planning
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ radioId: string; scheduleId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { radioId, scheduleId } = await params;

    await prisma.radioSchedule.delete({
      where: { id: scheduleId, radioId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("RADIO SCHEDULE DELETE ERROR:", error);
    return NextResponse.json({ error: "Erreur suppression" }, { status: 500 });
  }
}

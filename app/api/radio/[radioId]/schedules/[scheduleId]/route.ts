import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

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

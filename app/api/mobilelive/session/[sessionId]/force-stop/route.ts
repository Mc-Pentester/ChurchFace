/**
 * API Route pour forcer l'arrêt d'un live (admin only)
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLiveService } from "@/lib/mobilelive/MobileLiveService";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    const body = await request.json();
    const { reason } = body;

    // Récupérer le broadcast pour vérifier les permissions
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: sessionId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur a le droit d'arrêter ce live
    const canStop = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    }).then(async (user) => {
      if (!user) return false;
      // Admins globaux peuvent tout arrêter
      if (user.role === "ADMIN") return true;
      // Le propriétaire peut arrêter son live
      if (broadcast.authorId === session.user.id) return true;
      // Les admins de l'église peuvent arrêter les lives d'église
      if (broadcast.ownerType === "CHURCH") {
        const churchAdmin = await prisma.churchAdmin.findFirst({
          where: {
            userId: session.user.id,
            churchId: broadcast.ownerId,
          },
        });
        return !!churchAdmin;
      }
      return false;
    });

    if (!canStop) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Arrêter le live
    await MobileLiveService.stopLive(sessionId);

    // Notifier le diffuseur
    await createNotification({
      toUserId: broadcast.authorId,
      fromUserId: session.user.id,
      type: "LIVE_FORCE_STOPPED",
      message: `Votre live a été arrêté par un modérateur: ${reason}`,
      entityId: sessionId,
      entityType: "LIVE_BROADCAST",
      data: { broadcastId: sessionId, reason },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error force stopping live:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to force stop live" },
      { status: 500 }
    );
  }
}

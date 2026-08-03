/**
 * API Route pour modérer un live (avertissement, etc.)
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { MobileLivePermissionService } from "@/lib/mobilelive/MobileLivePermissionService";
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
    const { action, reason } = body;

    // Vérifier les permissions de modération
    const canModerate = await MobileLivePermissionService.canModerateLive({
      userId: session.user.id,
      broadcastId: sessionId,
    });

    if (!canModerate) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer le broadcast
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: sessionId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Envoyer une notification d'avertissement au diffuseur
    if (action === "WARN") {
      await createNotification({
        toUserId: broadcast.authorId,
        fromUserId: session.user.id,
        type: "MODERATION_WARNING",
        message: `Avertissement de modération: ${reason}`,
        entityId: sessionId,
        entityType: "LIVE_BROADCAST",
        data: { broadcastId: sessionId, reason },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error moderating live:", error);
    return NextResponse.json(
      { error: "Failed to moderate live" },
      { status: 500 }
    );
  }
}

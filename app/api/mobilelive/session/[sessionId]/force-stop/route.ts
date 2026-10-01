/**
 * API Route pour forcer l'arrêt d'un live (admin only)
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"
import { MobileLiveService } from "@/lib/mobilelive/MobileLiveService";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";
import { authorize } from "@/lib/authorization/policy";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await auth();
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

    // La décision d'autorisation est centralisée.
    const authorization = await authorize({
      actorId: session.user.id,
      action: "MOBILELIVE_STOP",
      resourceId: sessionId,
    });

    if (authorization.status !== 200) {
      return NextResponse.json(
        { error: authorization.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: authorization.status }
      );
    }

    // Arrêter le live
    await MobileLiveService.stopLive(sessionId, session.user.id);

    // Notifier le diffuseur
    await createNotification({
      userId: broadcast.authorId,
      senderId: session.user.id,
      type: "LIVE_FORCE_STOPPED",
      message: `Votre live a été arrêté par un modérateur: ${reason}`,
      entityId: sessionId,
      entityType: "LIVE_BROADCAST",
      metadata: { broadcastId: sessionId, reason },
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

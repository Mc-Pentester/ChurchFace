/**
 * API Route pour modérer un live (avertissement, etc.)
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth"
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
    const { action, reason } = body;

    const authorization = await authorize({
      actorId: session.user.id,
      action: "MOBILELIVE_MODERATE",
      resourceId: sessionId,
    });

    if (authorization.status !== 200) {
      return NextResponse.json(
        { error: authorization.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: authorization.status }
      );
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
        userId: broadcast.authorId,
        senderId: session.user.id,
        type: "MODERATION_WARNING",
        message: `Avertissement de modération: ${reason}`,
        entityId: sessionId,
        entityType: "LIVE_BROADCAST",
        metadata: { broadcastId: sessionId, reason },
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

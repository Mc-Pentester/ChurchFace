import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

/**
 * POST /api/calls - Créer un nouvel appel
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { recipientId, callType } = body;

    if (!recipientId || !callType) {
      return NextResponse.json(
        { error: "recipientId and callType are required" },
        { status: 400 }
      );
    }

    if (!["audio", "video"].includes(callType)) {
      return NextResponse.json(
        { error: "callType must be 'audio' or 'video'" },
        { status: 400 }
      );
    }

    // Vérifier que l'utilisateur ne s'appelle pas lui-même
    if (recipientId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot call yourself" },
        { status: 400 }
      );
    }

    // Créer l'appel
    const call = await prisma.call.create({
      data: {
        callerId: session.user.id,
        recipientId,
        callType,
        status: "incoming",
      },
    });

    // Créer la notification CALL_INCOMING
    await createNotification({
      userId: recipientId,
      senderId: session.user.id,
      type: "CALL_INCOMING",
      message: `Appel ${callType === "video" ? "vidéo" : "audio"} entrant`,
      entityId: call.id,
      entityType: "Call",
    });

    return NextResponse.json({ callId: call.id }, { status: 201 });
  } catch (error) {
    console.error("Error creating call:", error);
    return NextResponse.json(
      { error: "Failed to create call" },
      { status: 500 }
    );
  }
}

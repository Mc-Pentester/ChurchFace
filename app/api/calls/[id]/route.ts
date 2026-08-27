import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

/**
 * PATCH /api/calls/[id] - Mettre à jour le statut d'un appel
 */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "status is required" },
        { status: 400 }
      );
    }

    const validStatuses = ["incoming", "ringing", "connected", "ended", "missed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    // Récupérer l'appel
    const call = await prisma.call.findUnique({
      where: { id },
    });

    if (!call) {
      return NextResponse.json({ error: "Call not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est soit l'appelant soit le destinataire
    if (call.callerId !== session.user.id && call.recipientId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mettre à jour le statut
    const updatedCall = await prisma.call.update({
      where: { id },
      data: {
        status,
        endedAt: status === "ended" || status === "missed" ? new Date() : null,
      },
    });

    // Créer des notifications basées sur le statut
    if (status === "missed") {
      // Notifier l'appelant que l'appel a été manqué
      await createNotification({
        userId: call.callerId,
        senderId: call.recipientId,
        type: "CALL_MISSED",
        message: "Appel manqué",
        entityId: call.id,
        entityType: "Call",
      });
    } else if (status === "ended") {
      // Notifier les deux participants que l'appel est terminé
      await createNotification({
        userId: call.recipientId,
        senderId: call.callerId,
        type: "CALL_ENDED",
        message: "Appel terminé",
        entityId: call.id,
        entityType: "Call",
      });
    }

    return NextResponse.json(updatedCall);
  } catch (error) {
    console.error("Error updating call:", error);
    return NextResponse.json(
      { error: "Failed to update call" },
      { status: 500 }
    );
  }
}

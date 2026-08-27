import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { recipientId, callerName, callType } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: "recipientId is required" }, { status: 400 });
    }

    // Vérifier que l'appelant ne se notifie pas lui-même
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: "Cannot notify yourself" }, { status: 400 });
    }

    // Créer la notification via le système centralisé
    await createNotification({
      userId: recipientId,
      senderId: session.user.id,
      type: "CALL_INCOMING",
      message: `Appel ${callType === "video" ? "vidéo" : "audio"} entrant de ${callerName || "quelqu'un"}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating call notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

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
    const { recipientId, senderName, chatId } = await req.json();

    if (!recipientId) {
      return NextResponse.json({ error: "recipientId is required" }, { status: 400 });
    }

    // Vérifier que l'expéditeur ne se notifie pas lui-même
    if (recipientId === session.user.id) {
      return NextResponse.json({ error: "Cannot notify yourself" }, { status: 400 });
    }

    // Créer la notification via le système centralisé
    await createNotification({
      userId: recipientId,
      senderId: session.user.id,
      type: "MESSAGE_SENT",
      message: `Nouveau message de ${senderName || "quelqu'un"}`,
      entityId: chatId,
      entityType: "Chat",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error creating message notification:", error);
    return NextResponse.json(
      { error: "Failed to create notification" },
      { status: 500 }
    );
  }
}

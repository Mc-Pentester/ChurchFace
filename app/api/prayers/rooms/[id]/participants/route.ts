import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { createNotification } from "@/lib/notifications";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.id;
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const authorization = await authorize({ actorId: session.user.id, action: "PRAYER_ROOM_VIEW", resourceId: roomId });
    if (authorization.status !== 200) return NextResponse.json({ error: "Forbidden" }, { status: authorization.status });

    // Utiliser PrayerRoomParticipant comme source principale
    const participants = await prisma.prayerRoomParticipant.findMany({
      where: { roomId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });

    return NextResponse.json({ participants });
  } catch (error) {
    console.error("Erreur récupération participants salle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const roomId = resolvedParams.id;

    const authorization = await authorize({ actorId: session.user.id, action: "PRAYER_ROOM_JOIN", resourceId: roomId });
    if (authorization.status !== 200) return NextResponse.json({ error: authorization.status === 401 ? "Unauthorized" : "Forbidden" }, { status: authorization.status });

    // Check if already joined
    const existing = await prisma.prayerRoomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id
        }
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already joined" }, { status: 409 });
    }

    // Create participant
    const participant = await prisma.prayerRoomParticipant.create({
      data: {
        roomId,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        room: {
          include: {
            moderator: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    // Create notification for room moderator
    if (participant.room.moderator && participant.room.moderator.id !== session.user.id) {
      await createNotification({
        userId: participant.room.moderator.id,
        senderId: session.user.id,
        type: "PRAYER_ROOM_JOINED",
        message: `${session.user.name || "Someone"} joined your prayer room`,
        entityId: participant.id,
        entityType: "prayerRoomParticipant",
        metadata: { roomId },
      });
    }

    return NextResponse.json({ participant }, { status: 201 });
  } catch (error) {
    console.error("Erreur rejoindre salle:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const rooms = await prisma.prayerLiveRoom.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      _count: { select: { participants: true } },
    },
  });
  return NextResponse.json({ rooms });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { title, description, isPublic = true } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  const room = await prisma.prayerLiveRoom.create({
    data: {
      title: title.trim(),
      description: description?.trim() || null,
      isPublic: !!isPublic,
      moderatorId: session.user.id,
    },
    include: {
      _count: { select: { participants: true } },
    },
  });

  // Create notification for room started
  await createNotification({
    userId: session.user.id,
    senderId: session.user.id,
    type: "PRAYER_ROOM_STARTED",
    message: `Your prayer room "${room.title}" is now active`,
    entityId: room.id,
    entityType: "prayerLiveRoom",
    metadata: { roomId: room.id },
  });

  return NextResponse.json({ room }, { status: 201 });
}

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";
import { createNotification } from "@/lib/notifications";

export async function GET() {
  const session = await auth();
  const decision = await authorize({ actorId: session?.user?.id, action: "PRAYER_LIVE_VIEW" });
  if (decision.decision !== "ALLOW") {
    return NextResponse.json({ error: "Unauthorized" }, { status: decision.status });
  }

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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decision = await authorize({ actorId: session.user.id, action: "PRAYER_LIVE_CREATE" });
  if (decision.decision !== "ALLOW") {
    return NextResponse.json({ error: "Forbidden" }, { status: decision.status });
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

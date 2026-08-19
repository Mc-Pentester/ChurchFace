import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/notifications - Fetch notifications for current user
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const unreadOnly = searchParams.get("unread") === "true";
  const limit = parseInt(searchParams.get("limit") || "50", 10);
  const cursor = searchParams.get("cursor");
  const type = searchParams.get("type");
  const entityType = searchParams.get("entityType");

  const where: any = {
    userId: session.user.id,
    ...(unreadOnly ? { read: false } : {}),
    ...(type ? { type } : {}),
    ...(entityType ? { entityType } : {}),
  };

  const notifications = await prisma.notification.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    take: Math.min(limit, 100), // Max 100
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId: session.user.id,
      read: false,
    },
  });

  const nextCursor = notifications.length === limit ? notifications[notifications.length - 1].id : null;

  return NextResponse.json({ notifications, unreadCount, nextCursor });
}

// PATCH /api/notifications - Mark notifications as read
export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationIds, markAll } = await request.json();

  if (markAll) {
    await prisma.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  } else if (notificationIds && Array.isArray(notificationIds)) {
    await prisma.notification.updateMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  return NextResponse.json({ success: true });
}

// DELETE /api/notifications - Delete notifications
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { notificationIds, deleteAll } = await request.json();

  if (deleteAll) {
    await prisma.notification.deleteMany({
      where: {
        userId: session.user.id,
      },
    });
  } else if (notificationIds && Array.isArray(notificationIds)) {
    await prisma.notification.deleteMany({
      where: {
        id: { in: notificationIds },
        userId: session.user.id,
      },
    });
  }

  return NextResponse.json({ success: true });
}

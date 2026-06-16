import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST /api/friends/accept
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { friendshipId } = await request.json();

  if (!friendshipId) {
    return NextResponse.json({ error: "friendshipId is required" }, { status: 400 });
  }

  try {
    const friendship = await prisma.friendship.findUnique({
      where: { id: friendshipId },
    });

    if (!friendship) {
      return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
    }

    if (friendship.receiverId !== session.user.id) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    if (friendship.status !== "PENDING") {
      return NextResponse.json({ error: "Friend request already processed" }, { status: 400 });
    }

    const updated = await prisma.friendship.update({
      where: { id: friendshipId },
      data: { status: "ACCEPTED" },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification for sender
    await createNotification({
      toUserId: friendship.senderId,
      fromUserId: session.user.id,
      type: "FRIEND_ACCEPTED",
      message: `${session.user.name || "Someone"} a accepté votre demande d'ami`,
      entityId: friendship.id,
      entityType: "friendship",
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Accept friend request error:", error);
    return NextResponse.json({ error: "Failed to accept friend request" }, { status: 500 });
  }
}

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

// POST /api/friends/request
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { receiverId } = await request.json();

  if (!receiverId) {
    return NextResponse.json({ error: "receiverId is required" }, { status: 400 });
  }

  if (receiverId === session.user.id) {
    return NextResponse.json({ error: "Cannot add yourself" }, { status: 400 });
  }

  try {
    // Check if friendship already exists
    const existing = await prisma.friendship.findUnique({
      where: {
        senderId_receiverId: {
          senderId: session.user.id,
          receiverId,
        },
      },
    });

    if (existing) {
      if (existing.status === "PENDING") {
        return NextResponse.json({ error: "Friend request already sent" }, { status: 400 });
      }
      if (existing.status === "ACCEPTED") {
        return NextResponse.json({ error: "Already friends" }, { status: 400 });
      }
      if (existing.status === "BLOCKED") {
        return NextResponse.json({ error: "Friendship blocked" }, { status: 400 });
      }
    }

    // Create friendship request
    const friendship = await prisma.friendship.create({
      data: {
        senderId: session.user.id,
        receiverId,
        status: "PENDING",
      },
      include: {
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create notification
    await createNotification({
      toUserId: receiverId,
      fromUserId: session.user.id,
      type: "FRIEND_REQUEST",
      message: `${session.user.name || "Someone"} vous a envoyé une demande d'ami`,
      entityId: friendship.id,
      entityType: "friendship",
    });

    return NextResponse.json(friendship);
  } catch (error) {
    console.error("Friend request error:", error);
    return NextResponse.json({ error: "Failed to send friend request" }, { status: 500 });
  }
}

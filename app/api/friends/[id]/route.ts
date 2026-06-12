import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// PATCH /api/friends/[id] - Accept or decline friend request
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!status || !["ACCEPTED", "DECLINED", "BLOCKED"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const friendship = await prisma.friendship.findUnique({
    where: { id },
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
    where: { id },
    data: { status },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          bio: true,
        },
      },
    },
  });

  // If accepted, create notification for sender
  if (status === "ACCEPTED") {
    await prisma.notification.create({
      data: {
        type: "FRIEND_ACCEPTED",
        message: `${session.user.name || "Someone"} accepted your friend request`,
        userId: friendship.senderId,
        senderId: session.user.id,
        entityId: friendship.id,
        entityType: "friendship",
      },
    });
  }

  return NextResponse.json(updated);
}

// DELETE /api/friends/[id] - Unfriend or cancel request
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const friendship = await prisma.friendship.findUnique({
    where: { id },
  });

  if (!friendship) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  if (friendship.senderId !== session.user.id && friendship.receiverId !== session.user.id) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  await prisma.friendship.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}

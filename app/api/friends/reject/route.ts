import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// POST /api/friends/reject
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
      data: { status: "DECLINED" },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Reject friend request error:", error);
    return NextResponse.json({ error: "Failed to reject friend request" }, { status: 500 });
  }
}

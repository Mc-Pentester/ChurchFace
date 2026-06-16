import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/friends/mutual/:userId
export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  try {
    // Get current user's friends
    const currentUserFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
        status: "ACCEPTED",
      },
      select: { senderId: true, receiverId: true },
    });

    const currentUserFriendIds = new Set(
      currentUserFriendships.flatMap((f) => [f.senderId, f.receiverId])
    );

    // Get target user's friends
    const targetUserFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
        status: "ACCEPTED",
      },
      select: { senderId: true, receiverId: true },
    });

    const targetUserFriendIds = new Set(
      targetUserFriendships.flatMap((f) => [f.senderId, f.receiverId])
    );

    // Find mutual friends
    const mutualIds = Array.from(currentUserFriendIds).filter((id) =>
      targetUserFriendIds.has(id)
    );

    if (mutualIds.length === 0) {
      return NextResponse.json({ mutualFriends: [] });
    }

    // Get mutual friend details
    const mutualFriends = await prisma.user.findMany({
      where: {
        id: { in: mutualIds },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        church: true,
      },
    });

    return NextResponse.json({ mutualFriends });
  } catch (error) {
    console.error("Mutual friends error:", error);
    return NextResponse.json({ error: "Failed to get mutual friends" }, { status: 500 });
  }
}

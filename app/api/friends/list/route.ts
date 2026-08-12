import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/friends/list
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const targetUserId = searchParams.get("userId") || session.user.id;

  // Mobile optimization: reduce limit for slower connections
  const mobileLimit = searchParams.get("mobile") === "true" ? Math.min(limit, 10) : limit;

  console.log("FRIENDS LIST API - targetUserId:", targetUserId, "sessionUserId:", session.user.id);

  try {
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: targetUserId },
          { receiverId: targetUserId },
        ],
        status: "ACCEPTED",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            church: true,
            city: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            bio: true,
            church: true,
            city: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * mobileLimit,
      take: mobileLimit,
    });

    const users = friendships.map((f) => {
      const friend = f.senderId === targetUserId ? f.receiver : f.sender;
      return {
        ...friend,
        friendshipId: f.id,
        isSender: f.senderId === targetUserId,
        createdAt: f.createdAt,
      };
    });

    console.log("FRIENDS LIST API - friendships found:", friendships.length, "users mapped:", users.length);

    const total = await prisma.friendship.count({
      where: {
        OR: [
          { senderId: targetUserId },
          { receiverId: targetUserId },
        ],
        status: "ACCEPTED",
      },
    });

    console.log("FRIENDS LIST API - total count:", total);

    return NextResponse.json({
      users,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("List friends error:", error);
    return NextResponse.json({ error: "Failed to list friends" }, { status: 500 });
  }
}

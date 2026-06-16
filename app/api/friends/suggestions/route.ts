import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/friends/suggestions
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    // Get current user's friends
    const userFriendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
        status: "ACCEPTED",
      },
      select: { senderId: true, receiverId: true },
    });

    const friendIds = new Set(
      userFriendships.flatMap((f) => [f.senderId, f.receiverId])
    );
    friendIds.add(session.user.id);

    // Get users who are not friends
    const potentialFriends = await prisma.user.findMany({
      where: {
        id: { notIn: Array.from(friendIds) },
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        church: true,
        city: true,
      },
      take: limit * 3, // Get more to filter
    });

    // Calculate scores for suggestions based on mutual friends
    const scoredUsers = await Promise.all(
      potentialFriends.map(async (user) => {
        let score = 0;

        // Priority: Mutual friends
        const mutualFriendships = await prisma.friendship.count({
          where: {
            OR: [
              { senderId: user.id },
              { receiverId: user.id },
            ],
            status: "ACCEPTED",
            AND: [
              {
                OR: [
                  { senderId: { in: Array.from(friendIds) } },
                  { receiverId: { in: Array.from(friendIds) } },
                ],
              },
            ],
          },
        });
        score += mutualFriendships * 5;

        return {
          ...user,
          score,
          mutualFriends: mutualFriendships,
        };
      })
    );

    // Sort by score and return top suggestions
    const suggestions = scoredUsers
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("Suggestions error:", error);
    return NextResponse.json({ error: "Failed to get suggestions" }, { status: 500 });
  }
}

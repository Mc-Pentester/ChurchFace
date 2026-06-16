import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/friends/search?q=
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");

  if (query.length < 2) {
    return NextResponse.json({ users: [], total: 0 });
  }

  try {
    // Search by name, email, church, city
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { church: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
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
      skip: (page - 1) * limit,
      take: limit,
    });

    const total = await prisma.user.count({
      where: {
        id: { not: session.user.id },
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { church: { contains: query, mode: "insensitive" } },
          { city: { contains: query, mode: "insensitive" } },
        ],
      },
    });

    // Get friendship status for each user
    const usersWithStatus = await Promise.all(
      users.map(async (user) => {
        const friendship = await prisma.friendship.findUnique({
          where: {
            senderId_receiverId: {
              senderId: session.user.id,
              receiverId: user.id,
            },
          },
        });

        const reverseFriendship = await prisma.friendship.findUnique({
          where: {
            senderId_receiverId: {
              senderId: user.id,
              receiverId: session.user.id,
            },
          },
        });

        let status = "NONE";
        if (friendship) {
          status = friendship.status === "ACCEPTED" ? "FRIENDS" : friendship.status;
        } else if (reverseFriendship) {
          status = reverseFriendship.status === "ACCEPTED" ? "FRIENDS" : "RECEIVED";
        }

        return {
          ...user,
          friendshipStatus: status,
        };
      })
    );

    return NextResponse.json({
      users: usersWithStatus,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}

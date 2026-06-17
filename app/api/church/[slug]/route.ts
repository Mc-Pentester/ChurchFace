import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  try {
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            members: true,
            followers: true,
            events: true,
            posts: true,
          },
        },
        admins: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if user is following this church
    let isFollowing = false;
    if (session?.user) {
      const follow = await prisma.churchFollow.findUnique({
        where: {
          churchId_userId: {
            churchId: church.id,
            userId: session.user.id,
          },
        },
      });
      isFollowing = !!follow;
    }

    return NextResponse.json({
      ...church,
      isFollowing,
    });
  } catch (error) {
    console.error("Error fetching church:", error);
    return NextResponse.json(
      { error: "Failed to fetch church" },
      { status: 500 }
    );
  }
}

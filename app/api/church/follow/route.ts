import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { churchId } = await req.json();

    if (!churchId) {
      return NextResponse.json(
        { error: "churchId is required" },
        { status: 400 }
      );
    }

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { id: churchId },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId,
          userId: session.user.id,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.churchFollow.delete({
        where: {
          churchId_userId: {
            churchId,
            userId: session.user.id,
          },
        },
      });

      // Decrement follower count
      await prisma.church.update({
        where: { id: churchId },
        data: {
          followerCount: {
            decrement: 1,
          },
        },
      });

      return NextResponse.json({ following: false });
    } else {
      // Follow
      await prisma.churchFollow.create({
        data: {
          churchId,
          userId: session.user.id,
        },
      });

      // Increment follower count
      await prisma.church.update({
        where: { id: churchId },
        data: {
          followerCount: {
            increment: 1,
          },
        },
      });

      return NextResponse.json({ following: true });
    }
  } catch (error) {
    console.error("Error toggling church follow:", error);
    return NextResponse.json(
      { error: "Failed to toggle follow" },
      { status: 500 }
    );
  }
}

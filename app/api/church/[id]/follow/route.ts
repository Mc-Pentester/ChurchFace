import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { id },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if already following
    const existingFollow = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId: id,
          userId: session.user.id,
        },
      },
    });

    if (existingFollow) {
      return NextResponse.json({ error: "Already following" }, { status: 400 });
    }

    // Create follow
    const follow = await prisma.churchFollow.create({
      data: {
        churchId: id,
        userId: session.user.id,
      },
    });

    // Update follower count
    await prisma.church.update({
      where: { id },
      data: {
        followerCount: {
          increment: 1,
        },
      },
    });

    return NextResponse.json({ success: true, follow });
  } catch (error) {
    console.error("Error following church:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Delete follow
    await prisma.churchFollow.delete({
      where: {
        churchId_userId: {
          churchId: id,
          userId: session.user.id,
        },
      },
    });

    // Update follower count
    await prisma.church.update({
      where: { id },
      data: {
        followerCount: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error unfollowing church:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

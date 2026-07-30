import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

/**
 * POST /api/church/[slug]/follow
 * Follow a church (creates ChurchFollow)
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database. Please re-login." }, { status: 401 });
    }

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { slug },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if already following
    const existing = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Already following this church" }, { status: 409 });
    }

    // Create follow
    const follow = await prisma.churchFollow.create({
      data: {
        churchId: church.id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ success: true, following: true, follow });
  } catch (err) {
    console.error("POST /api/church/[slug]/follow error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * DELETE /api/church/[slug]/follow
 * Unfollow a church (deletes ChurchFollow)
 */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found in database. Please re-login." }, { status: 401 });
    }

    // Check if church exists
    const church = await prisma.church.findUnique({
      where: { slug },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if following
    const existing = await prisma.churchFollow.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Not following this church" }, { status: 404 });
    }

    // Delete follow
    await prisma.churchFollow.delete({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
    });

    return NextResponse.json({ success: true, following: false });
  } catch (err) {
    console.error("DELETE /api/church/[slug]/follow error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

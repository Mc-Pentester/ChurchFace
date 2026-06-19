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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const session = await getServerSession(authOptions);
  const { slug } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, slogan, logo, coverImage, website, email, phone, address, city, country } = await req.json();

    // Get church by slug
    const church = await prisma.church.findUnique({
      where: { slug },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Check if user is admin of this church
    const admin = await prisma.churchAdmin.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
    });

    if (!admin) {
      // Check if user is SUPER_ADMIN or ADMIN
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      });

      if (user?.role !== "SUPER_ADMIN" && user?.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    // Update church
    const updatedChurch = await prisma.church.update({
      where: { id: church.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(slogan !== undefined && { slogan }),
        ...(logo !== undefined && { logo }),
        ...(coverImage !== undefined && { coverImage }),
        ...(website !== undefined && { website }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
      },
    });

    return NextResponse.json({ success: true, church: updatedChurch });
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json(
      { error: "Failed to update church" },
      { status: 500 }
    );
  }
}

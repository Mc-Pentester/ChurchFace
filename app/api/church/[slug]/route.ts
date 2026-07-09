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
    // Fetch church with minimal admin info first (no emails)
    const church = await prisma.church.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            members: true,
            follows: true,
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
                image: true,
              },
            },
          },
        },
        lives: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // If the requester is an admin of the church (or global admin), include email addresses
    let isAdmin = false;
    if (session?.user) {
      const adminRecord = await prisma.churchAdmin.findUnique({
        where: {
          churchId_userId: {
            churchId: church.id,
            userId: session.user.id,
          },
        },
      });

      if (adminRecord) isAdmin = true;

      if (!isAdmin) {
        const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
        if (user?.role === "SUPER_ADMIN" || user?.role === "ADMIN") isAdmin = true;
      }
    }

    if (isAdmin) {
      // fetch admins again including email
      const adminsWithEmail = await prisma.churchAdmin.findMany({
        where: { churchId: church.id },
        include: {
          user: { select: { id: true, name: true, email: true, image: true } },
        },
        orderBy: { appointedAt: "asc" },
      });

      // replace the admins field with the enriched version
      (church as any).admins = adminsWithEmail;
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

    return NextResponse.json({ ...church, isFollowing });
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
    const formData = await req.formData();
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const slogan = formData.get("slogan") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;
    const city = formData.get("city") as string;
    const country = formData.get("country") as string;
    const website = formData.get("website") as string;
    const scheduleStr = formData.get("schedule") as string;
    const logoFile = formData.get("logo") as File | null;
    const coverFile = formData.get("coverImage") as File | null;
    const removeLogo = formData.get("removeLogo") === "true";
    const removeCover = formData.get("removeCover") === "true";

    // Get church by slug
    const church = await prisma.church.findUnique({
      where: { slug },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    let schedule: any = church.schedule;
    if (scheduleStr) {
      try {
        schedule = JSON.parse(scheduleStr);
      } catch (e) {
        console.error("Error parsing schedule:", e);
      }
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

    // Handle image uploads (convert to base64 for simplicity)
    let logoUrl = church.logo;
    let coverUrl = church.coverImage;

    if (removeLogo) {
      logoUrl = null;
    } else if (logoFile && logoFile.size > 0) {
      const bytes = await logoFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      logoUrl = `data:${logoFile.type};base64,${buffer.toString("base64")}`;
    }

    if (removeCover) {
      coverUrl = null;
    } else if (coverFile && coverFile.size > 0) {
      const bytes = await coverFile.arrayBuffer();
      const buffer = Buffer.from(bytes);
      coverUrl = `data:${coverFile.type};base64,${buffer.toString("base64")}`;
    }

    // Update church
    const updatedChurch = await prisma.church.update({
      where: { id: church.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(slogan !== undefined && { slogan }),
        ...(logoUrl !== undefined && { logo: logoUrl }),
        ...(coverUrl !== undefined && { coverImage: coverUrl }),
        ...(email !== undefined && { email }),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(city !== undefined && { city }),
        ...(country !== undefined && { country }),
        ...(website !== undefined && { website }),
        ...(schedule !== undefined && { schedule }),
      },
    });

    return NextResponse.json(updatedChurch);
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json({ error: "Failed to update church" }, { status: 500 });
  }
}

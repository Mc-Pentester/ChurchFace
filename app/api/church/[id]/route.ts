import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, slug, description, slogan, logo, coverImage, website, email, phone, address, city, country } = await req.json();

    // Check if user is admin of this church
    const admin = await prisma.churchAdmin.findUnique({
      where: {
        churchId_userId: {
          churchId: id,
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

    // Check if slug is already taken (if changing slug)
    if (slug) {
      const existingChurch = await prisma.church.findFirst({
        where: {
          slug,
          NOT: { id },
        },
      });

      if (existingChurch) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 409 }
        );
      }
    }

    // Update church
    const church = await prisma.church.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
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

    return NextResponse.json({ success: true, church });
  } catch (error) {
    console.error("Error updating church:", error);
    return NextResponse.json(
      { error: "Failed to update church" },
      { status: 500 }
    );
  }
}

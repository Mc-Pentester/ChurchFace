import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "20"), 1), 100);
    const cursor = searchParams.get("cursor");
    const role = searchParams.get("role");

    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const membership = await prisma.churchMember.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
      select: { id: true, isActive: true },
    });

    const admin = await prisma.churchAdmin.findUnique({
      where: {
        churchId_userId: {
          churchId: church.id,
          userId: session.user.id,
        },
      },
      select: { id: true },
    });

    const globalAdmin = session.user.role === "ADMIN" || session.user.role === "SUPER_ADMIN";
    if (!globalAdmin && !admin && !membership?.isActive) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await prisma.churchMember.findMany({
      where: {
        churchId: church.id,
        isActive: true,
        ...(role ? { role } : {}),
      },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      orderBy: { joinedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    let nextCursor: string | null = null;
    if (members.length > limit) {
      const nextItem = members.pop();
      nextCursor = nextItem!.id;
    }

    return NextResponse.json({ members, nextCursor });
  } catch (error) {
    console.error("Error fetching church members:", error);
    return NextResponse.json({ error: "Failed to fetch church members" }, { status: 500 });
  }
}

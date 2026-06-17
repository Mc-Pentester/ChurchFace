import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "20");
    const cursor = searchParams.get("cursor");
    const role = searchParams.get("role"); // MEMBER, ELDER, DEACON, YOUTH_LEADER, MUSICIAN

    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const members = await prisma.churchMember.findMany({
      where: { 
        churchId: church.id,
        isActive: true,
        ...(role && { role }),
      },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
      orderBy: { joinedAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
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

    return NextResponse.json({
      members,
      nextCursor,
    });
  } catch (error) {
    console.error("Error fetching church members:", error);
    return NextResponse.json(
      { error: "Failed to fetch church members" },
      { status: 500 }
    );
  }
}

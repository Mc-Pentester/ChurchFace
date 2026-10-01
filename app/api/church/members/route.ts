import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const filter = searchParams.get("filter") || "all";
    const search = searchParams.get("search") || "";

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const where: any = { churchId, isActive: true };

    if (filter === "pastors") {
      where.role = "PASTOR";
    } else if (filter === "admins") {
      where.role = { in: ["OWNER", "CHURCH_ADMIN"] };
    } else if (filter === "members") {
      where.role = "MEMBER";
    }

    if (search) {
      where.user = {
        name: {
          contains: search,
          mode: "insensitive",
        },
      };
    }

    const members = await prisma.churchMember.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
  }
}

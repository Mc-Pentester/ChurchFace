import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const type = searchParams.get("type") || "requests";

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    let prayers: any[] = [];

    if (type === "requests") {
      prayers = await prisma.prayerRequest.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } else if (type === "answers") {
      prayers = await prisma.prayerResponse.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    } else if (type === "testimonies") {
      prayers = await prisma.prayerTestimony.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      });
    }

    return NextResponse.json({ prayers });
  } catch (error) {
    console.error("Error fetching prayers:", error);
    return NextResponse.json({ error: "Failed to fetch prayers" }, { status: 500 });
  }
}

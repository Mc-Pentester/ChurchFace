import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const churchId = searchParams.get("churchId");
    const type = searchParams.get("type") || "all";

    if (!churchId) {
      return NextResponse.json({ error: "churchId is required" }, { status: 400 });
    }

    const where: any = { churchId };
    if (type !== "all") {
      where.type = type;
    }

    const media = await prisma.churchMedia.findMany({
      where,
      orderBy: { order: "asc" },
      take: 50,
    });

    return NextResponse.json({ media });
  } catch (error) {
    console.error("Error fetching media:", error);
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

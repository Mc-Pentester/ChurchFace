import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const church = await prisma.church.findUnique({
      where: { slug },
      select: { id: true, liveEnabled: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    if (!church.liveEnabled) {
      return NextResponse.json(
        { error: "Live is not enabled for this church" },
        { status: 403 }
      );
    }

    const live = await prisma.churchLive.findFirst({
      where: { 
        churchId: church.id,
        status: "LIVE",
      },
      orderBy: { startedAt: "desc" },
    });

    if (!live) {
      // Check for scheduled lives
      const scheduled = await prisma.churchLive.findFirst({
        where: { 
          churchId: church.id,
          status: "SCHEDULED",
          scheduledAt: {
            gte: new Date(),
          },
        },
        orderBy: { scheduledAt: "asc" },
      });

      return NextResponse.json({
        isLive: false,
        scheduled: scheduled || null,
      });
    }

    return NextResponse.json({
      isLive: true,
      live,
    });
  } catch (error) {
    console.error("Error fetching church live:", error);
    return NextResponse.json(
      { error: "Failed to fetch church live" },
      { status: 500 }
    );
  }
}

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
      select: { id: true },
    });

    if (!church) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const live = await prisma.churchLive.findFirst({
      where: { 
        churchId: church.id,
        status: "LIVE",
      },
      orderBy: { startedAt: "desc" },
    });

    if (!live) {
      // Return the most recent live regardless of status
      const recentLive = await prisma.churchLive.findFirst({
        where: { 
          churchId: church.id,
        },
        orderBy: { createdAt: "desc" },
        take: 1,
      });

      return NextResponse.json({
        isLive: false,
        live: recentLive || null,
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

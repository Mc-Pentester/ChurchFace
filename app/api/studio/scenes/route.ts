import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const broadcastId = searchParams.get("broadcastId");
  const churchLiveId = searchParams.get("churchLiveId");

  try {
    const where: any = {};
    if (broadcastId) where.broadcastId = broadcastId;
    if (churchLiveId) where.churchLiveId = churchLiveId;

    const scenes = await prisma.studioScene.findMany({
      where,
      include: {
        sources: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(scenes);
  } catch (error) {
    console.error("Error fetching scenes:", error);
    return NextResponse.json({ error: "Failed to fetch scenes" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, order, broadcastId, churchLiveId } = await req.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const scene = await prisma.studioScene.create({
      data: {
        name,
        description,
        order: order || 0,
        broadcastId,
        churchLiveId,
      },
      include: {
        sources: true,
      },
    });

    return NextResponse.json(scene, { status: 201 });
  } catch (error) {
    console.error("Error creating scene:", error);
    return NextResponse.json({ error: "Failed to create scene" }, { status: 500 });
  }
}

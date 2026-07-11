import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "LIVE";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const broadcasts = await prisma.liveBroadcast.findMany({
      where: {
        status: status as any,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(broadcasts);
  } catch (error) {
    console.error("Error fetching live broadcasts:", error);
    return NextResponse.json(
      { error: "Failed to fetch live broadcasts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, streamUrl } = await req.json();

    if (!title || !streamUrl) {
      return NextResponse.json(
        { error: "Title and stream URL are required" },
        { status: 400 }
      );
    }

    const broadcast = await prisma.liveBroadcast.create({
      data: {
        title,
        description,
        streamUrl,
        status: "OFFLINE",
      },
    });

    return NextResponse.json(broadcast, { status: 201 });
  } catch (error) {
    console.error("Error creating live broadcast:", error);
    return NextResponse.json(
      { error: "Failed to create live broadcast" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const broadcastId = searchParams.get("broadcastId");

  try {
    const where: any = {};
    if (broadcastId) where.broadcastId = broadcastId;

    const outputs = await prisma.studioOutput.findMany({
      where,
      orderBy: { type: "asc" },
    });

    return NextResponse.json(outputs);
  } catch (error) {
    console.error("Error fetching outputs:", error);
    return NextResponse.json({ error: "Failed to fetch outputs" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { type, enabled, config, streamKey, streamUrl, broadcastId } = await req.json();

    if (!type || !broadcastId) {
      return NextResponse.json(
        { error: "Type and broadcastId are required" },
        { status: 400 }
      );
    }

    const output = await prisma.studioOutput.create({
      data: {
        type,
        enabled: enabled ?? false,
        config,
        streamKey,
        streamUrl,
        broadcastId,
      },
    });

    return NextResponse.json(output, { status: 201 });
  } catch (error) {
    console.error("Error creating output:", error);
    return NextResponse.json({ error: "Failed to create output" }, { status: 500 });
  }
}

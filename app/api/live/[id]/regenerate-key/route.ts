import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { regenerateStreamKey } from "@/lib/stream/streamGenerator";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Check if user owns this broadcast
    if (broadcast.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Generate new stream key
    const newStreamKey = regenerateStreamKey();

    // Update broadcast with new stream key
    const updated = await prisma.liveBroadcast.update({
      where: { id },
      data: {
        streamKey: newStreamKey,
      },
    });

    return NextResponse.json({
      streamKey: newStreamKey,
      rtmpUrl: updated.rtmpUrl,
    });
  } catch (error) {
    console.error("Error regenerating stream key:", error);
    return NextResponse.json(
      { error: "Failed to regenerate stream key" },
      { status: 500 }
    );
  }
}

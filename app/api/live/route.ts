import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { generateStreamIdentifiers } from "@/lib/stream/streamGenerator";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "LIVE";
  const limit = parseInt(searchParams.get("limit") || "10");

  try {
    const broadcasts = await prisma.liveBroadcast.findMany({
      where: {
        status,
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

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { title, description, streamUrl, streamMode } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Create broadcast first to get ID
    const tempBroadcast = await prisma.liveBroadcast.create({
      data: {
        title,
        description,
        streamUrl: streamUrl || "",
        streamMode: streamMode || "RTMP",
        status: "SCHEDULED",
        authorId: session.user.id,
      },
    });

    // Generate stream identifiers with actual broadcast ID
    const serverUrl = process.env.CHURCHFACE_SERVER_URL || "live.churchface.com";
    const streamIdentifiers = generateStreamIdentifiers(serverUrl, tempBroadcast.id);

    // Update broadcast with stream identifiers
    const broadcast = await prisma.liveBroadcast.update({
      where: { id: tempBroadcast.id },
      data: {
        streamUrl: streamUrl || streamIdentifiers.ingestUrl,
        streamId: streamIdentifiers.streamId,
        streamKey: streamIdentifiers.streamKey,
        ingestUrl: streamIdentifiers.ingestUrl,
        playbackUrl: streamIdentifiers.playbackUrl,
        rtmpUrl: streamIdentifiers.rtmpUrl,
        rtmpsUrl: streamIdentifiers.rtmpsUrl,
        livekitRoom: streamIdentifiers.liveKitRoom,
        ingestProtocol: "RTMP",
        playbackProtocol: "WEBRTC",
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
import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const body = await req.json();
    const { broadcastId, isPublisher = false } = body;

    if (typeof isPublisher !== "boolean") {
      return NextResponse.json({ error: "isPublisher must be a boolean" }, { status: 400 });
    }

    if (!broadcastId || typeof broadcastId !== "string") {
      return NextResponse.json({ error: "broadcastId is required" }, { status: 400 });
    }

    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: broadcastId },
      select: { id: true, livekitRoom: true, status: true },
    });

    if (!broadcast || !broadcast.livekitRoom) {
      return NextResponse.json({ error: "Live broadcast not found" }, { status: 404 });
    }

    if (isPublisher && !userId) {
      return NextResponse.json({ error: "Publishing requires authentication" }, { status: 401 });
    }

    const authorization = await authorize({
      actorId: userId,
      action: isPublisher ? "LIVEKIT_PUBLISH" : "LIVEKIT_VIEW",
      resourceId: broadcastId,
    });

    if (!authorization.allowed) {
      return NextResponse.json(
        { error: authorization.status === 401 ? "Unauthorized" : "Forbidden" },
        { status: authorization.status }
      );
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "LiveKit configuration missing" }, { status: 500 });
    }

    const identity = userId ?? `viewer-${crypto.randomUUID()}`;
    const participantName = session?.user?.name || "Viewer";

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      name: participantName,
    });

    token.addGrant({
      room: broadcast.livekitRoom,
      roomJoin: true,
      canPublish: Boolean(isPublisher),
      canSubscribe: true,
    });

    const accessToken = await token.toJwt();

    return NextResponse.json({ token: accessToken, url: livekitUrl });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}

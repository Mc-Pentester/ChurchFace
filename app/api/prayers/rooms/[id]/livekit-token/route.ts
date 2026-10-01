import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { auth } from "@/lib/auth";
import { authorize } from "@/lib/authorization/policy";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;
    const { id: prayerRoomId } = await params;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const room = await prisma.prayerRoom.findUnique({
      where: { id: prayerRoomId },
      select: {
        id: true,
        isActive: true,
        roomType: true,
      },
    });

    if (!room) {
      return NextResponse.json({ error: "Prayer room not found" }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json({ error: "Prayer room is inactive" }, { status: 403 });
    }

    if (room.roomType === "TEXT") {
      return NextResponse.json({ error: "LiveKit is not available for text rooms" }, { status: 400 });
    }

    const authorization = await authorize({
      actorId: userId,
      action: "PRAYER_ROOM_JOIN",
      resourceId: prayerRoomId,
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

    const token = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: session.user?.name || "Participant",
    });

    token.addGrant({
      room: `prayer-${prayerRoomId}`,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const accessToken = await token.toJwt();

    return NextResponse.json({
      token: accessToken,
      url: livekitUrl,
      roomName: `prayer-${prayerRoomId}`,
    });
  } catch (error) {
    console.error("Error generating prayer room LiveKit token:", error);
    return NextResponse.json({ error: "Failed to generate token" }, { status: 500 });
  }
}

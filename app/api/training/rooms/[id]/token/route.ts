import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AccessToken } from "livekit-server-sdk";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resolvedParams = await params;
    const { userName } = await req.json();

    const room = await prisma.trainingRoom.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!room) {
      return NextResponse.json({ error: "Formation non trouvée" }, { status: 404 });
    }

    if (!room.isActive) {
      return NextResponse.json({ error: "Formation inactive" }, { status: 400 });
    }

    const isInstructor = room.instructorId === session.user.id;
    const isMember = await prisma.trainingRoomMember.findUnique({
      where: { trainingRoomId_userId: { trainingRoomId: room.id, userId: session.user.id } },
      select: { id: true },
    });
    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } });
    const isGlobalAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

    if (!room.isPublic && !isInstructor && !isMember && !isGlobalAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Créer le token LiveKit
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL;

    if (!apiKey || !apiSecret || !livekitUrl) {
      return NextResponse.json({ error: "Configuration LiveKit manquante" }, { status: 500 });
    }

    const roomName = `training-${resolvedParams.id}`;
    const participantName = userName || session.user.name || "Participant";

    const at = new AccessToken(apiKey, apiSecret, {
      identity: session.user.id,
      name: participantName,
    });

    at.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    const token = at.toJwt();
    const url = livekitUrl.replace("wss://", "https://");

    return NextResponse.json({ token, url });
  } catch (error) {
    console.error("Erreur création token:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

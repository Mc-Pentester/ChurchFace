/**
 * API Route pour générer un token LiveKit pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AccessToken } from "livekit-server-sdk";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Récupérer le broadcast
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: sessionId },
    });

    if (!broadcast) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Vérifier que l'utilisateur est le propriétaire
    if (broadcast.authorId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Configuration LiveKit
    const livekitUrl = process.env.LIVEKIT_URL || "ws://localhost:7880";
    const livekitApiKey = process.env.LIVEKIT_API_KEY || "devkey";
    const livekitApiSecret = process.env.LIVEKIT_API_SECRET || "secret";

    // Nom de la room
    const roomName = broadcast.livekitRoom || `mobile_${broadcast.id}`;

    // Créer le token
    const token = new AccessToken(livekitApiKey, livekitApiSecret, {
      identity: session.user.id,
      name: session.user.name || "Mobile Broadcaster",
    });

    token.addGrant({
      room: roomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: false, // Le diffuseur n'a pas besoin de s'abonner
      canPublishData: true,
    });

    const jwt = await token.toJwt();

    return NextResponse.json({
      url: livekitUrl,
      token: jwt,
      roomName,
    });
  } catch (error) {
    console.error("Error generating LiveKit token:", error);
    return NextResponse.json(
      { error: "Failed to generate token" },
      { status: 500 }
    );
  }
}

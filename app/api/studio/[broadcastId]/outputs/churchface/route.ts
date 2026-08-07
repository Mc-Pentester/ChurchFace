/**
 * API Route pour obtenir les credentials ChurchFace (stream key et RTMP URL)
 * Ces credentials peuvent être utilisés pour configurer des destinations externes
 * qui pull le stream depuis ChurchFace
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";
import { decrypt } from "@/lib/crypto/encryption";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ broadcastId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { broadcastId } = await params;

    // Vérifier que l'utilisateur a accès à ce broadcast
    const broadcast = await prisma.liveBroadcast.findFirst({
      where: {
        id: broadcastId,
        OR: [
          { authorId: session.user.id },
          { ownerId: session.user.id },
        ],
      },
    });

    if (!broadcast) {
      return NextResponse.json(
        { error: "Broadcast not found or access denied" },
        { status: 404 }
      );
    }

    // S'assurer que la sortie ChurchFace existe
    const churchfaceOutput = await BroadcastOutputService.ensurePrimaryOutput(broadcastId);

    // Récupérer les credentials complets
    const outputWithCredentials = await prisma.studioOutput.findUnique({
      where: { id: churchfaceOutput.id },
    });

    if (!outputWithCredentials) {
      return NextResponse.json(
        { error: "Failed to retrieve ChurchFace output" },
        { status: 500 }
      );
    }

    // Retourner les credentials pour utilisation externe
    return NextResponse.json({
      rtmpUrl: outputWithCredentials.streamUrl,
      streamKey: outputWithCredentials.streamKey ? decrypt(outputWithCredentials.streamKey) : null,
      playbackUrl: broadcast.playbackUrl || `${process.env.NEXT_PUBLIC_APP_URL}/watch/${broadcastId}`,
      broadcastId: broadcastId,
      isPrimary: outputWithCredentials.isPrimary,
      status: outputWithCredentials.status,
    });
  } catch (error) {
    console.error("Error fetching ChurchFace credentials:", error);
    return NextResponse.json(
      { error: "Failed to fetch ChurchFace credentials" },
      { status: 500 }
    );
  }
}


/**
 * API Route pour récupérer les stats de monitoring d'un broadcast
 *
 * Récupère les données disponibles depuis la base de données.
 * Les statistiques réseau/système restent actuellement des valeurs
 * de fallback tant que l'intégration LiveKit Monitoring n'est pas branchée.
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    if (!broadcastId) {
      return NextResponse.json(
        { error: "Broadcast ID is required" },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------------------
    // 1. Récupérer le broadcast
    // -------------------------------------------------------------------------

    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: broadcastId },
      select: {
        id: true,
        ownerType: true,
        ownerId: true,
        authorId: true,
        startedAt: true,
        createdAt: true,
        viewerCount: true,
        outputs: true,
      },
    });

    if (!broadcast) {
      return NextResponse.json(
        { error: "Broadcast not found" },
        { status: 404 }
      );
    }

    // -------------------------------------------------------------------------
    // 2. Vérification des permissions
    // -------------------------------------------------------------------------

    let hasAccess = false;

    const userId = session.user.id;

    // Broadcast personnel
    if (
      broadcast.ownerType === "USER" &&
      broadcast.ownerId &&
      broadcast.ownerId === userId
    ) {
      hasAccess = true;
    }

    // L'auteur du broadcast possède également l'accès.
    //
    // Cette vérification est faite avant la vérification ChurchAdmin
    // afin d'éviter toute dépendance inutile au churchId.
    if (!hasAccess && broadcast.authorId === userId) {
      hasAccess = true;
    }

    // Broadcast d'église
    //
    // IMPORTANT :
    // ownerId peut être NULL pour certains anciens ou nouveaux broadcasts.
    // On ne doit JAMAIS envoyer null à churchAdmin.findUnique().
    if (
      !hasAccess &&
      broadcast.ownerType === "CHURCH" &&
      broadcast.ownerId
    ) {
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: {
          churchId_userId: {
            churchId: broadcast.ownerId,
            userId,
          },
        },
        select: {
          id: true,
        },
      });

      hasAccess = !!churchAdmin;
    }

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // -------------------------------------------------------------------------
    // 3. Calcul de la durée
    // -------------------------------------------------------------------------

    const now = new Date();

    const startTime = broadcast.startedAt || broadcast.createdAt;

    const duration = Math.max(
      0,
      Math.floor(
        (now.getTime() - startTime.getTime()) / 1000
      )
    );

    // -------------------------------------------------------------------------
    // 4. Statistiques réseau
    //
    // TODO:
    // Remplacer ces valeurs par les vraies métriques LiveKit Monitoring.
    // -------------------------------------------------------------------------

    const networkStats = {
      bitrate: 4500,
      fps: 30,
      resolution: {
        width: 1920,
        height: 1080,
      },
      packetLoss: 0.1,
      rtt: 25,
      jitter: 5,
    };

    // -------------------------------------------------------------------------
    // 5. Statistiques système
    //
    // TODO:
    // Brancher les vraies métriques serveur.
    // -------------------------------------------------------------------------

    const systemStats = {
      cpuUsage: 25,
      memoryUsage: 45,
      bandwidth: {
        upload: networkStats.bitrate / 1024,
        download: 0,
      },
    };

    // -------------------------------------------------------------------------
    // 6. Statistiques générales du stream
    // -------------------------------------------------------------------------

    const streamStats = {
      duration,
      viewers: broadcast.viewerCount ?? 0,
      uptime: duration,
      bytesSent: 0,
      bytesReceived: 0,
    };

    // -------------------------------------------------------------------------
    // 7. Indexation des outputs
    //
    // On évite de refaire plusieurs .find() sur le même tableau.
    // -------------------------------------------------------------------------

    const outputs = broadcast.outputs ?? [];

    const findOutput = (...types: string[]) =>
      outputs.find((output) => {
        const type = String(output.type ?? "").toUpperCase();
        const platform = String(output.platform ?? "").toUpperCase();

        return types.some(
          (value) =>
            type === value.toUpperCase() ||
            platform === value.toUpperCase()
        );
      });

    const churchFaceOutput = findOutput(
      "CHURCHFACE",
      "NATIVE_CHURCHFACE",
      "WEBRTC"
    );

    const youtubeOutput = findOutput("YOUTUBE");

    const facebookOutput = findOutput("FACEBOOK");

    const twitchOutput = findOutput("TWITCH");

    const recordingOutput = findOutput(
      "RECORDING",
      "RECORD"
    );

    // -------------------------------------------------------------------------
    // 8. Stats des outputs
    // -------------------------------------------------------------------------

    const outputStats = {
      churchFace: {
        status: churchFaceOutput?.enabled
          ? "active"
          : "idle" as const,
        bitrate: churchFaceOutput?.enabled
          ? networkStats.bitrate
          : 0,
        fps: churchFaceOutput?.enabled
          ? networkStats.fps
          : 0,
      },

      youtube: {
        status: youtubeOutput?.enabled
          ? "active"
          : "idle" as const,
        bitrate: youtubeOutput?.enabled
          ? networkStats.bitrate
          : 0,
        fps: youtubeOutput?.enabled
          ? networkStats.fps
          : 0,
      },

      facebook: {
        status: facebookOutput?.enabled
          ? "active"
          : "idle" as const,
        bitrate: facebookOutput?.enabled
          ? networkStats.bitrate
          : 0,
        fps: facebookOutput?.enabled
          ? networkStats.fps
          : 0,
      },

      twitch: {
        status: twitchOutput?.enabled
          ? "active"
          : "idle" as const,
        bitrate: twitchOutput?.enabled
          ? networkStats.bitrate
          : 0,
        fps: twitchOutput?.enabled
          ? networkStats.fps
          : 0,
      },

      recording: {
        status: recordingOutput?.enabled
          ? "active"
          : "idle" as const,
        size: 0,
        duration: recordingOutput?.enabled
          ? duration
          : 0,
      },
    };

    // -------------------------------------------------------------------------
    // 9. Réponse
    // -------------------------------------------------------------------------

    return NextResponse.json({
      network: networkStats,
      system: systemStats,
      stream: streamStats,
      outputs: outputStats,
      timestamp: now.getTime(),
    });
  } catch (error) {
    console.error(
      "Error fetching monitoring stats:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to fetch monitoring stats",
      },
      {
        status: 500,
      }
    );
  }
}


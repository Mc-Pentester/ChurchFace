/**
 * API Route pour récupérer les stats de monitoring d'un broadcast
 * Récupère les vraies données depuis la base de données
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
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { broadcastId } = await params;

    // Vérifier que l'utilisateur a accès à ce broadcast
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
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }

    // Vérifier les permissions d'accès
    let hasAccess = false;
    
    if (broadcast.ownerType === "USER" && broadcast.ownerId === session.user.id) {
      // Broadcast personnel de l'utilisateur
      hasAccess = true;
    } else if (broadcast.ownerType === "CHURCH") {
      // Broadcast d'église : vérifier si l'utilisateur est admin
      const churchAdmin = await prisma.churchAdmin.findUnique({
        where: {
          churchId_userId: {
            churchId: broadcast.ownerId!,
            userId: session.user.id,
          },
        },
      });
      hasAccess = !!churchAdmin;
    } else if (broadcast.authorId === session.user.id) {
      // L'auteur du broadcast a aussi accès
      hasAccess = true;
    }

    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Récupérer les stats de monitoring depuis la base
    const now = new Date();
    const startTime = broadcast.startedAt || broadcast.createdAt;
    const duration = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    // Stats réseau (simulées pour l'instant, à remplacer par vraies stats LiveKit)
    const networkStats = {
      bitrate: 4500, // À remplacer par vraies stats
      fps: 30,
      resolution: { width: 1920, height: 1080 },
      packetLoss: 0.1,
      rtt: 25,
      jitter: 5,
    };

    // Stats système (à remplacer par vraies stats du serveur)
    const systemStats = {
      cpuUsage: 25,
      memoryUsage: 45,
      bandwidth: {
        upload: networkStats.bitrate / 1024,
        download: 0,
      },
    };

    // Stats stream depuis la base
    const streamStats = {
      duration,
      viewers: broadcast.viewerCount || 0,
      uptime: duration,
      bytesSent: 0, // À calculer depuis les logs
      bytesReceived: 0,
    };

    // Stats des outputs depuis la base
    const outputStats = {
      churchFace: {
        status: broadcast.outputs.find(o => o.type === "NATIVE_CHURCHFACE")?.enabled ? "active" : "idle" as const,
        bitrate: networkStats.bitrate,
        fps: networkStats.fps,
      },
      youtube: {
        status: broadcast.outputs.find(o => o.type === "YOUTUBE")?.enabled ? "active" : "idle" as const,
        bitrate: broadcast.outputs.find(o => o.type === "YOUTUBE")?.enabled ? networkStats.bitrate : 0,
        fps: broadcast.outputs.find(o => o.type === "YOUTUBE")?.enabled ? networkStats.fps : 0,
      },
      facebook: {
        status: broadcast.outputs.find(o => o.type === "FACEBOOK")?.enabled ? "active" : "idle" as const,
        bitrate: broadcast.outputs.find(o => o.type === "FACEBOOK")?.enabled ? networkStats.bitrate : 0,
        fps: broadcast.outputs.find(o => o.type === "FACEBOOK")?.enabled ? networkStats.fps : 0,
      },
      twitch: {
        status: broadcast.outputs.find(o => o.type === "TWITCH")?.enabled ? "active" : "idle" as const,
        bitrate: broadcast.outputs.find(o => o.type === "TWITCH")?.enabled ? networkStats.bitrate : 0,
        fps: broadcast.outputs.find(o => o.type === "TWITCH")?.enabled ? networkStats.fps : 0,
      },
      recording: {
        status: broadcast.outputs.find(o => o.type === "RECORDING")?.enabled ? "active" : "idle" as const,
        size: 0, // À calculer depuis les fichiers d'enregistrement
        duration: broadcast.outputs.find(o => o.type === "RECORDING")?.enabled ? duration : 0,
      },
    };

    return NextResponse.json({
      network: networkStats,
      system: systemStats,
      stream: streamStats,
      outputs: outputStats,
      timestamp: now.getTime(),
    });
  } catch (error) {
    console.error("Error fetching monitoring stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch monitoring stats" },
      { status: 500 }
    );
  }
}

/**
 * Service principal pour Mobile Live
 * ChurchFace V1 - Live Mobile Instantané
 * Réutilise l'infrastructure LiveKit existante
 */

import { prisma } from "@/lib/prisma";
import { MobileLiveContext, MobileLiveConfig, MobileLiveSession, MobileLiveStatus } from "./MobileLiveTypes";
import { MobileLivePermissionService } from "./MobileLivePermissionService";
import { MobileLiveRateLimiter } from "./MobileLiveRateLimiter";
import { BroadcastOutputService } from "@/lib/broadcast/BroadcastOutputService";
import { createNotification } from "@/lib/notifications";

export class MobileLiveService {
  /**
   * Crée une nouvelle session de live mobile
   */
  static async createSession(params: {
    userId: string;
    context: MobileLiveContext;
    ownerId: string;
    ownerType: "USER" | "CHURCH";
    config: MobileLiveConfig;
  }): Promise<MobileLiveSession> {
    const { userId, context, ownerId, ownerType, config } = params;

    // Vérifier les permissions
    const permissions = await MobileLivePermissionService.canStartLive({
      userId,
      context,
      ownerId,
      ownerType,
    });

    if (!permissions.canStartLive) {
      throw new Error(permissions.reason || "Permission denied");
    }

    // Vérifier le rate limiting
    const rateLimit = await MobileLiveRateLimiter.canCreateSession(userId);
    if (!rateLimit.allowed) {
      throw new Error(rateLimit.reason || "Rate limit exceeded");
    }

    // Créer le broadcast dans la base de données
    const broadcast = await prisma.liveBroadcast.create({
      data: {
        title: config.title,
        description: config.description,
        authorId: userId,
        ownerType,
        ownerId,
        status: "SCHEDULED",
        streamMode: "WEBRTC",
        streamUrl: "", // Will be set by LiveKit
        recordingEnabled: config.enableRecording,
        outputDestinations: {
          enableChat: config.enableChat,
          enableReactions: config.enableReactions,
          visibility: config.visibility,
        },
      },
    });

    // Générer le nom de room LiveKit
    const roomName = `mobile_${broadcast.id}`;

    // Créer la session
    const session: MobileLiveSession = {
      id: broadcast.id,
      userId,
      context,
      ownerId,
      ownerType,
      config,
      status: "SETUP",
      broadcastId: broadcast.id,
      roomName,
      camera: "front",
      cameraEnabled: true,
      microphoneEnabled: true,
      viewerCount: 0,
      duration: 0,
    };

    return session;
  }

  /**
   * Démarre un live mobile
   */
  static async startLive(sessionId: string): Promise<MobileLiveSession> {
    // Mettre à jour le broadcast
    const broadcast = await prisma.liveBroadcast.update({
      where: { id: sessionId },
      data: {
        status: "LIVE",
        startedAt: new Date(),
        livekitRoom: `mobile_${sessionId}`,
      },
    });

    // Créer automatiquement la destination native ChurchFace
    await BroadcastOutputService.createNativeOutput(sessionId);

    // Créer les destinations externes si configurées
    const outputDestinations = broadcast.outputDestinations as any;
    if (outputDestinations?.externalDestinations) {
      // TODO: Implémenter createExternalOutput dans BroadcastOutputService
      // Pour l'instant, on stocke les destinations dans outputDestinations
      // et elles seront traitées par le système de diffusion existant
      console.log("External destinations configured:", outputDestinations.externalDestinations);
    }

    // Envoyer les notifications
    await this.sendLiveStartNotifications(broadcast);

    return {
      id: broadcast.id,
      userId: broadcast.authorId,
      context: broadcast.ownerId === broadcast.authorId ? "PERSONAL" : "CHURCH",
      ownerId: broadcast.ownerId || broadcast.authorId,
      ownerType: broadcast.ownerType as "USER" | "CHURCH",
      config: {
        title: broadcast.title,
        description: broadcast.description || undefined,
        visibility: "PUBLIC",
        enableRecording: broadcast.recordingEnabled,
        enableChat: true,
        enableReactions: true,
        externalDestinations: outputDestinations?.externalDestinations || [],
      },
      status: "LIVE",
      broadcastId: broadcast.id,
      roomName: broadcast.livekitRoom || undefined,
      camera: "front",
      cameraEnabled: true,
      microphoneEnabled: true,
      viewerCount: broadcast.viewerCount,
      duration: 0,
      startedAt: broadcast.startedAt || undefined,
    };
  }

  /**
   * Envoie les notifications de démarrage de live
   */
  private static async sendLiveStartNotifications(broadcast: any) {
    // Pour les lives personnels, notifier les abonnés
    if (broadcast.ownerType === "USER") {
      const followers = await prisma.friendship.findMany({
        where: { 
          receiverId: broadcast.authorId,
          status: "ACCEPTED",
        },
        select: { senderId: true },
      });

      for (const follower of followers) {
        // Vérifier les préférences de notification de l'utilisateur
        const user = await prisma.user.findUnique({
          where: { id: follower.senderId },
          select: { permissions: true },
        });

        const preferences = (user?.permissions as any) || {};
        const shouldNotify = preferences.liveNotifications !== false;

        if (shouldNotify) {
          await createNotification({
            toUserId: follower.senderId,
            fromUserId: broadcast.authorId,
            type: "LIVE_STARTED",
            message: `est en direct : ${broadcast.title}`,
            entityId: broadcast.id,
            entityType: "LIVE_BROADCAST",
            data: { broadcastId: broadcast.id },
          });
        }
      }
    }

    // Pour les lives d'église, notifier les abonnés et membres
    if (broadcast.ownerType === "CHURCH" && broadcast.ownerId) {
      // Notifier les abonnés de l'église
      const followers = await prisma.churchFollow.findMany({
        where: { churchId: broadcast.ownerId },
        select: { userId: true },
      });

      for (const follower of followers) {
        // Vérifier les préférences de notification
        const user = await prisma.user.findUnique({
          where: { id: follower.userId },
          select: { permissions: true },
        });

        const preferences = (user?.permissions as any) || {};
        const shouldNotify = preferences.churchLiveNotifications !== false;

        if (shouldNotify) {
          await createNotification({
            toUserId: follower.userId,
            fromUserId: broadcast.authorId,
            type: "CHURCH_LIVE_STARTED",
            message: `est en direct : ${broadcast.title}`,
            entityId: broadcast.id,
            entityType: "LIVE_BROADCAST",
            data: { broadcastId: broadcast.id, churchId: broadcast.ownerId },
          });
        }
      }

      // Notifier les membres de l'église avec préférences
      const members = await prisma.churchMember.findMany({
        where: { 
          churchId: broadcast.ownerId,
        },
        select: { userId: true, notificationPreferences: true },
      });

      for (const member of members) {
        const memberPreferences = (member.notificationPreferences as any) || {};
        const shouldNotify = memberPreferences.churchLiveNotifications !== false;

        if (shouldNotify) {
          await createNotification({
            toUserId: member.userId,
            fromUserId: broadcast.authorId,
            type: "CHURCH_LIVE_STARTED",
            message: `est en direct : ${broadcast.title}`,
            entityId: broadcast.id,
            entityType: "LIVE_BROADCAST",
            data: { broadcastId: broadcast.id, churchId: broadcast.ownerId },
          });
        }
      }
    }
  }

  /**
   * Arrête un live mobile
   */
  static async stopLive(sessionId: string): Promise<MobileLiveSession> {
    const broadcast = await prisma.liveBroadcast.update({
      where: { id: sessionId },
      data: {
        status: "ENDED",
        endedAt: new Date(),
        recordingStatus: "STOPPED",
      },
    });

    // Désactiver toutes les outputs
    await BroadcastOutputService.disableAllOutputs(sessionId);

    // Créer le replay si l'enregistrement était activé
    if (broadcast.recordingEnabled) {
      await this.createReplay(sessionId);
    }

    return {
      id: broadcast.id,
      userId: broadcast.authorId,
      context: broadcast.ownerId === broadcast.authorId ? "PERSONAL" : "CHURCH",
      ownerId: broadcast.ownerId || broadcast.authorId,
      ownerType: broadcast.ownerType as "USER" | "CHURCH",
      config: {
        title: broadcast.title,
        description: broadcast.description || undefined,
        visibility: "PUBLIC",
        enableRecording: broadcast.recordingEnabled,
        enableChat: true,
        enableReactions: true,
      },
      status: "ENDED",
      broadcastId: broadcast.id,
      roomName: broadcast.livekitRoom || undefined,
      camera: "front",
      cameraEnabled: false,
      microphoneEnabled: false,
      viewerCount: broadcast.viewerCount,
      duration: broadcast.duration || 0,
      startedAt: broadcast.startedAt || undefined,
      endedAt: broadcast.endedAt || undefined,
    };
  }

  /**
   * Met à jour les statistiques d'un live
   */
  static async updateStats(params: {
    sessionId: string;
    viewerCount: number;
    bitrate?: number;
    fps?: number;
  }): Promise<void> {
    const { sessionId, viewerCount, bitrate, fps } = params;

    await prisma.liveBroadcast.update({
      where: { id: sessionId },
      data: {
        viewerCount,
        bitrate,
        peakViewerCount: Math.max(
          viewerCount,
          (await prisma.liveBroadcast.findUnique({ where: { id: sessionId } }))?.peakViewerCount || 0
        ),
      },
    });
  }

  /**
   * Obtient une session de live
   */
  static async getSession(sessionId: string): Promise<MobileLiveSession | null> {
    const broadcast = await prisma.liveBroadcast.findUnique({
      where: { id: sessionId },
    });

    if (!broadcast) {
      return null;
    }

    return {
      id: broadcast.id,
      userId: broadcast.authorId,
      context: broadcast.ownerId === broadcast.authorId ? "PERSONAL" : "CHURCH",
      ownerId: broadcast.ownerId || broadcast.authorId,
      ownerType: broadcast.ownerType as "USER" | "CHURCH",
      config: {
        title: broadcast.title,
        description: broadcast.description || undefined,
        visibility: "PUBLIC",
        enableRecording: broadcast.recordingEnabled,
        enableChat: true,
        enableReactions: true,
      },
      status: broadcast.status === "LIVE" ? "LIVE" : broadcast.status === "ENDED" ? "ENDED" : "SETUP",
      broadcastId: broadcast.id,
      roomName: broadcast.livekitRoom || undefined,
      camera: "front",
      cameraEnabled: true,
      microphoneEnabled: true,
      viewerCount: broadcast.viewerCount,
      duration: broadcast.duration || 0,
      startedAt: broadcast.startedAt || undefined,
      endedAt: broadcast.endedAt || undefined,
    };
  }

  /**
   * Crée un replay après un live
   */
  private static async createReplay(sessionId: string): Promise<void> {
    try {
      // Récupérer le broadcast
      const broadcast = await prisma.liveBroadcast.findUnique({
        where: { id: sessionId },
      });

      if (!broadcast || !broadcast.recordingEnabled) {
        return;
      }

      // Créer une publication pour le replay
      const replayPost = await prisma.post.create({
        data: {
          content: `Replay du live : ${broadcast.title}`,
          authorId: broadcast.authorId,
          generatedType: "VIDEO",
          generatedId: sessionId,
          videoUrl: broadcast.recordingUrl || "",
          imageUrl: broadcast.thumbnail,
          hashtags: ["live", "replay"],
        },
      });

      // Mettre à jour le broadcast avec l'ID du replay
      await prisma.liveBroadcast.update({
        where: { id: sessionId },
        data: {
          replayUrl: `/post/${replayPost.id}`,
        },
      });

      console.log(`Replay created for session ${sessionId}, post ID: ${replayPost.id}`);
    } catch (error) {
      console.error("Error creating replay:", error);
    }
  }

  /**
   * Force l'arrêt d'un live (pour les admins)
   */
  static async forceStopLive(sessionId: string, adminUserId: string): Promise<void> {
    const canStop = await MobileLivePermissionService.canStopLive({
      userId: adminUserId,
      broadcastId: sessionId,
    });

    if (!canStop) {
      throw new Error("Permission denied");
    }

    await this.stopLive(sessionId);
  }
}

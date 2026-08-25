import { prisma } from "./prisma";
import { getSocketServer } from "./io";
import { sendPushNotification } from "./push/sendPushNotification";

/**
 * Service unique de création et envoi de notifications
 *
 * Ce service est responsable de :
 * 1. Créer la notification en base (source de vérité)
 * 2. Émettre l'événement Socket.IO pour le temps réel
 * 3. Déclencher le Web Push si nécessaire
 * 4. Éviter les doublons
 * 5. Gérer les erreurs proprement
 */
export async function createNotification({
  userId,
  senderId,
  type,
  message,
  entityId,
  entityType,
  metadata,
}: {
  userId: string;
  senderId?: string;
  type: string;
  message: string;
  entityId?: string;
  entityType?: string;
  metadata?: any;
}) {
  try {
    // 1. SAVE DB (source de vérité)
    const notif = await prisma.notification.create({
      data: {
        userId,
        senderId,
        type,
        message,
        entityId,
        entityType,
        metadata: metadata ?? {},
      },
    });

    // 2. SOCKET REALTIME (si user connecté)
    const io = getSocketServer();
    if (io) {
      io.to(`user:${userId}`).emit("notification:new", notif);
    }

    // 3. PUSH NOTIFICATION (même si site fermé)
    try {
      await sendPushNotification(userId, {
        title: "ChurchFace",
        body: message,
        url: entityId ? `/post/${entityId}` : "/",
        type,
      });
    } catch (err) {
      console.error("Push notification error:", err);
      // Ne pas échouer toute la notification si push échoue
    }

    return notif;
  } catch (error) {
    console.error("Failed to create notification:", error);
    throw error;
  }
}

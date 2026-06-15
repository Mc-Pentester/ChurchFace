import { prisma } from "./prisma";
import { getSocketServer } from "./io";
import { sendPushNotification } from "./push/sendPushNotification";

/**
 * Fonction utilitaire pour créer et envoyer des notifications
 * Peut être utilisée depuis server.ts ou les API routes
 */
export async function createNotification({
  toUserId,
  fromUserId,
  type,
  message,
  entityId,
  entityType,
  data,
}: {
  toUserId: string;
  fromUserId?: string;
  type: string;
  message: string;
  entityId?: string;
  entityType?: string;
  data?: any;
}) {
  // 1. SAVE DB (source de vérité)
  const notif = await prisma.notification.create({
    data: {
      userId: toUserId,
      senderId: fromUserId,
      type,
      message,
      entityId,
      entityType,
      data,
    },
  });

  // 2. SOCKET REALTIME (si user connecté)
  const io = getSocketServer();
  if (io) {
    io.to(`user:${toUserId}`).emit("notification:new", notif);
  }

  // 3. PUSH NOTIFICATION (même si site fermé)
  try {
    await sendPushNotification(toUserId, {
      title: "ChurchFace",
      body: message,
      url: entityId ? `/post/${entityId}` : "/",
      type,
    });
  } catch (err) {
    console.error("Push notification error:", err);
  }

  return notif;
}

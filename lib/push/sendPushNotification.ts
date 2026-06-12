import webpush from "web-push";
import { prisma } from "../prisma";

export async function sendPushNotification(userId: string, payload: any) {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  const notifications = subs.map((sub) =>
    webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      },
      JSON.stringify(payload)
    )
  );

  await Promise.allSettled(notifications);
}
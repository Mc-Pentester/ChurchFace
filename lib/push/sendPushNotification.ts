import webpush from "web-push";
import { prisma } from "../prisma";

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const privateVapidKey = process.env.VAPID_PRIVATE_KEY || "";
const vapidContact = process.env.VAPID_CONTACT_EMAIL || "contact@churchface.com";

if (publicVapidKey && privateVapidKey) {
  try {
    webpush.setVapidDetails(`mailto:${vapidContact}`, publicVapidKey, privateVapidKey);
  } catch (err) {
    console.warn("Failed to set VAPID details:", err);
  }
} else {
  console.warn("VAPID keys not configured. Web push will not be sent.");
}

/**
 * Send a push notification to all subscriptions of a user.
 * - Handles keys stored either as a JSON string or as an object in the `keys` field.
 * - Removes stale subscriptions when web-push returns 410/404.
 */
export async function sendPushNotification(userId: string, payload: any) {
  const subs = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (!subs || subs.length === 0) {
    // Nothing to do
    return [];
  }

  const promises = subs.map(async (sub) => {
    try {
      // Normalize keys: could be stored as JSON string or object
      let keys: any = (sub as any).keys;
      if (typeof keys === "string" && keys.length > 0) {
        try {
          keys = JSON.parse(keys);
        } catch (e) {
          // not JSON — leave as-is
        }
      }

      const p256dh = keys?.p256dh || keys?.p256dh?.toString?.();
      const auth = keys?.auth;

      if (!sub.endpoint || !p256dh || !auth) {
        console.warn("Invalid push subscription (missing endpoint/keys):", sub.id);
        return { status: "skipped", id: sub.id };
      }

      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh, auth },
        } as any,
        typeof payload === "string" ? payload : JSON.stringify(payload)
      );

      return { status: "ok", id: sub.id };
    } catch (err: any) {
      console.error("Push send failed for subscription", sub.id, err?.message || err);

      // Clean up stale subscriptions (GONE / NOT FOUND)
      const statusCode = err?.statusCode || err?.status;
      if (statusCode === 410 || statusCode === 404) {
        try {
          await prisma.pushSubscription.delete({ where: { id: sub.id } });
          console.log("Removed stale push subscription:", sub.id);
        } catch (e) {
          console.warn("Failed to remove stale subscription:", sub.id, e);
        }
      }

      return { status: "error", id: sub.id, error: err?.message || String(err) };
    }
  });

  const results = await Promise.allSettled(promises);
  // Normalize results for the caller
  const normalized = results.map((r) =>
    r.status === "fulfilled" ? r.value : { status: "error", error: r.reason }
  );

  return normalized;
}
